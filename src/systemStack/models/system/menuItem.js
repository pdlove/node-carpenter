import { CarpenterModel, CarpenterModelRelationship, DataTypes } from "../../../../index.js";

const NIL_UUID = "00000000-0000-0000-0000-000000000000";

export default class MenuItem extends CarpenterModel {
  static defaultReadAccess = "guest";
  static sequelizeDefinition = {
    menu_id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
    parent_menu_id: { type: DataTypes.UUID, allowNull: false, comment: 'If this is not a root item, this points at the parent' },
    sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, comment: '1-based order within the same parent. Subitems restart at 1.' },
    icon_class: { type: DataTypes.STRING, allowNull: true, comment: 'If using the CSS-based icons it will have a class' },
    icon_text: { type: DataTypes.STRING, allowNull: true, comment: 'If not using CSS-based icons, this is the 1 or 2 letters to display in a circle where the icon goes.' },
    display_text: { type: DataTypes.STRING, allowNull: false, comment: 'Text Displayed to the user when not in a collapsed view' },
    nav_jsx: { type: DataTypes.STRING, allowNull: true, comment: 'React Panel to Load, if any' },
    nav_jsx_parameters: { type: DataTypes.JSON, allowNull: true, comment: 'Parameters to pass to a react panel, if any' },
    nav_jsx_asmodal: { type: DataTypes.BOOLEAN, allowNull: true, comment: 'If loading a react panel, this as TRUE will display a modal instead of loading in the main viewport' },
    nav_popup_link: { type: DataTypes.STRING, allowNull: true, comment: 'If filled, then this URL is opened in a new tab' },
    nav_js_code: { type: DataTypes.STRING, allowNull: true, comment: 'If filled, this Javascript is executed on click.' },
  }

  static sequelizeOptions = {
    indexes: [{ unique: true, fields: ['parent_menu_id', 'sort_order'] }]
  };

  static async ensureMenuPath(menuPath, leafNavProps = {}) {
    // normalize & split on backslashes (supports single or doubled)
    const segments = menuPath
      .split(/\\+/g)
      .map(s => s.trim())
      .filter(Boolean);

    if (segments.length === 0) {
      throw new Error('menuPath is empty after normalization.');
    }

    const t = await this.carpenterServer.sequelize.transaction();
    try {
      let parentId = NIL_UUID;
      let parentRow = null;        // will always refer to the *current* parent row
      const createdMap = {};       // segment -> boolean (created?)
      const createdOrFound = [];   // the chain of nodes

      for (const segment of segments) {
        // Try to find the node under the current parent
        let node = await this.sequelizeObject.findOne({
          where: { parent_menu_id: parentId, display_text: segment },
          transaction: t,
          lock: t.LOCK.UPDATE // helps in PG; safe to include; no-op in sqlite
        });

        if (!node) {
          // compute next sort_order within a transaction to avoid collisions
          const siblingCount = await this.sequelizeObject.count({
            where: { parent_menu_id: parentId },
            transaction: t,
            lock: t.LOCK.UPDATE
          });

          try {
            node = await this.sequelizeObject.create({
              parent_menu_id: parentId,
              display_text: segment,
              sort_order: siblingCount + 1
            }, { transaction: t });

            createdMap[segment] = true;
          } catch (err) {
            // If two writers raced, unique constraint may fire — re-read
            // (requires the unique index on (parent_menu_id, display_text))
            if (err.name === 'SequelizeUniqueConstraintError') {
              node = await this.sequelizeObject.findOne({
                where: { parent_menu_id: parentId, display_text: segment },
                transaction: t,
                lock: t.LOCK.UPDATE
              });
              createdMap[segment] = false;
            } else {
              throw err;
            }
          }
        } else {
          createdMap[segment] = false;
        }

        createdOrFound.push(node);
        parentRow = node;         // parent for the next iteration becomes this node
        parentId = node.menu_id;  // advance to next level
      }

      // The final (leaf) node is the last one we touched
      const leaf = createdOrFound[createdOrFound.length - 1];

      // The "parent menu" of the leaf is either:
      //  - the previous node in the chain, if there was one
      //  - or the synthetic "root" if path had only one segment
      let parentMenu;
      if (segments.length > 1) {
        parentMenu = createdOrFound[createdOrFound.length - 2];
      } else {
        // Represent the root as a plain object
        parentMenu = {
          menu_id: NIL_UUID,
          display_text: '(root)',
          parent_menu_id: null,
          sort_order: null
        };
      }

      // Update nav_* fields on the leaf if provided
      const navKeys = [
        'icon_class', 'icon_text', 'nav_jsx', 'nav_jsx_parameters',
        'nav_jsx_asmodal', 'nav_popup_link', 'nav_js_code'
      ];
      const updatePayload = {};
      for (const k of navKeys) {
        if (k in leafNavProps) updatePayload[k] = leafNavProps[k];
      }
      if (Object.keys(updatePayload).length > 0) {
        await leaf.update(updatePayload, { transaction: t });
      }

      // Count number of entries on the parent (i.e., children of parentMenu)
      const parentIdForCount = parentMenu.menu_id;
      const numEntriesOnParent = await this.sequelizeObject.count({
        where: { parent_menu_id: parentIdForCount },
        transaction: t
      });

      await t.commit();

      return {
        path: segments,
        parentMenu: parentMenu.get ? parentMenu.get({ plain: true }) : parentMenu,
        numEntriesOnParent,
        leaf: leaf.get({ plain: true }),
        createdMap
      };
    } catch (e) {
      await t.rollback();
      throw e;
    }
  }

  static seedDataCore = []

  static seedDataDemo = [];
};
