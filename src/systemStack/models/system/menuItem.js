module.exports = (sequelize, DataTypes) => {
    const MenuItem = sequelize.define('MenuItems', {
      menuID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      parentMenuID: DataTypes.INTEGER,
      iconClass: DataTypes.STRING,
      iconText: DataTypes.STRING,
      displayText: DataTypes.STRING,
      navControl: DataTypes.STRING,
      navControlParameters: DataTypes.STRING,
      navPopupLink: DataTypes.STRING,
      navJSCode: DataTypes.STRING
    }, {});
  
    return MenuItem;
  };
