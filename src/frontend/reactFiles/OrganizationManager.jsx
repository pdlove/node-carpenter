const { useEffect, useMemo, useState } = React;


export default function OrganizationManager({ http }) {
    const [organizations, setOrganizations] = useState([])
    const [selectedOrgId, setSelectedOrgId] = useState(null)
    const [orgModal, setOrgModal] = useState(null)
    const [tab, setTab] = useState('users')

    useEffect(() => {
        ; (async () => {
            const list = await http('/api/data/organization')
            setOrganizations(list)
            if (list.length && !selectedOrgId) setSelectedOrgId(list[0].organizationId)
        })().catch(console.error)
    }, [])

    const selectedOrg = useMemo(() => organizations.find((o) => o.organizationId === selectedOrgId) || null, [organizations, selectedOrgId])

    const upsertOrg = async (org) => {
        if (org.organizationId) {
            const updated = await http(`/api/data/organization/${org.organizationId}`, { method: 'PUT', body: JSON.stringify(org) })
            setOrganizations((list) => list.map((x) => (x.organizationId === updated.organizationId ? updated : x)))
        } else {
            const created = await http(`/api/data/organization`, { method: 'POST', body: JSON.stringify(org) })
            setOrganizations((list) => [...list, created])
            setSelectedOrgId(created.organizationId)
        }
    }

    const deleteOrg = async (orgId) => {
        await http(`/api/data/organization/${orgId}`, { method: 'DELETE' })
        setOrganizations((list) => list.filter((x) => x.organizationId !== orgId))
        if (selectedOrgId === orgId) setSelectedOrgId(null)
    }

    return (
        <div class="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div class="label" style={{ margin: 0 }}>Organization</div>
                    <select class="input" style={{ width: 320 }} value={selectedOrgId || ''} onChange={(e) => setSelectedOrgId(e.currentTarget.value)}>
                        {organizations.map((o) => (
                            <option key={o.organizationId} value={o.organizationId}>{o.name}</option>
                        ))}
                    </select>
                    <button class="btn" onClick={() => setOrgModal({ mode: 'add', org: { name: '', description: '', otpRequired: 0 } })}>Add</button>
                    {selectedOrg ? (
                        <>
                            <button class="btn" onClick={() => setOrgModal({ mode: 'edit', org: selectedOrg })}>Edit</button>
                            <button class="btn danger" onClick={() => deleteOrg(selectedOrg.organizationId)}>Delete</button>
                        </>
                    ) : null}
                </div>
            </div>

            <div class="tabs">
                <div class={"tab " + (tab === 'users' ? 'active' : '')} onClick={() => setTab('users')}>Users</div>
                <div class={"tab " + (tab === 'groups' ? 'active' : '')} onClick={() => setTab('groups')}>Groups</div>
            </div>

            {selectedOrg ? (
                <div style={{ marginTop: 12 }}>
                    {tab === 'users' ? <UsersPanel http={http} organizationId={selectedOrg.organizationId} /> : <GroupsPanel http={http} organizationId={selectedOrg.organizationId} />}
                </div>
            ) : (
                <div style={{ color: 'var(--muted)', marginTop: 12 }}>No organization selected</div>
            )}

            {orgModal ? (
                <OrgModal
                    mode={orgModal.mode}
                    org={orgModal.org}
                    onClose={() => setOrgModal(null)}
                    onSave={async (data) => {
                        await upsertOrg(data)
                        setOrgModal(null)
                    }}
                />
            ) : null}
        </div>
    )
}

function OrgModal({ mode, org, onClose, onSave }) {
    const [name, setName] = useState(org?.name || '')
    const [description, setDescription] = useState(org?.description || '')
    const [otpRequired, setOtpRequired] = useState(org?.otpRequired ?? 0)

    const submit = (e) => {
        e && e.preventDefault()
        onSave({ ...org, name, description, otpRequired })
    }

    return (
        <div class="modal-backdrop">
            <div class="card modal" style={{ padding: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 10 }}>{mode === 'add' ? 'Add' : 'Edit'} Organization</div>
                <form onSubmit={submit}>
                    <div class="form-group">
                        <div class="label">Name</div>
                        <input class="input" value={name} onInput={(e) => setName(e.currentTarget.value)} required />
                    </div>
                    <div class="form-group">
                        <div class="label">Description</div>
                        <input class="input" value={description} onInput={(e) => setDescription(e.currentTarget.value)} />
                    </div>
                    <div class="form-group">
                        <div class="label">OTP Required</div>
                        <select class="input" value={String(otpRequired)} onChange={(e) => setOtpRequired(parseInt(e.currentTarget.value))}>
                            <option value="0">No</option>
                            <option value="1">Yes</option>
                        </select>
                    </div>
                    <div class="form-actions">
                        <button class="btn" type="button" onClick={onClose}>Cancel</button>
                        <button class="btn primary" type="submit">Save</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function UsersPanel({ http, organizationId }) {
    const [users, setUsers] = useState([])
    const [modal, setModal] = useState(null)

    const refresh = async () => {
        const list = await http(`/api/data/user?organizationId=${encodeURIComponent(organizationId)}`)
        setUsers(list)
    }

    useEffect(() => {
        refresh().catch(console.error)
    }, [organizationId])

    const upsert = async (user) => {
        if (user.userId) {
            const updated = await http(`/api/data/user/${user.userId}`, { method: 'PUT', body: JSON.stringify(user) })
            setUsers((list) => list.map((x) => (x.userId === updated.userId ? updated : x)))
        } else {
            const created = await http(`/api/data/user`, { method: 'POST', body: JSON.stringify({ ...user, organizationId }) })
            setUsers((list) => [...list, created])
        }
    }

    const remove = async (userId) => {
        await http(`/api/data/user/${userId}`, { method: 'DELETE' })
        setUsers((list) => list.filter((x) => x.userId !== userId))
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ color: 'var(--muted)' }}>{users.length} users</div>
                <button class="btn" onClick={() => setModal({ mode: 'add', user: { userType: 'person', groups: [], name: '', email: '', title: '', description: '' } })}>Add User</button>
            </div>
            <table class="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Title</th>
                        <th>Groups</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u) => (
                        <tr key={u.userId}>
                            <td>{u.name}</td>
                            <td>{u.email}</td>
                            <td>{u.title}</td>
                            <td style={{ color: 'var(--muted)' }}>{u.groups?.join(', ')}</td>
                            <td style={{ textAlign: 'right' }}>
                                <div class="row" style={{ justifyContent: 'flex-end' }}>
                                    <button class="btn" onClick={() => setModal({ mode: 'edit', user: u })}>Edit</button>
                                    <button class="btn danger" onClick={() => remove(u.userId)}>Delete</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {modal ? (
                <UserModal
                    http={http}
                    mode={modal.mode}
                    user={modal.user}
                    onClose={() => setModal(null)}
                    onSave={async (data) => {
                        await upsert(data)
                        setModal(null)
                    }}
                    refresh={refresh}
                />
            ) : null}
        </div>
    )
}

function UserModal({ http, mode, user, onClose, onSave, refresh }) {
    const [name, setName] = useState(user?.name || '')
    const [email, setEmail] = useState(user?.email || '')
    const [title, setTitle] = useState(user?.title || '')
    const [description, setDescription] = useState(user?.description || '')
    const [password, setPassword] = useState('')
    const [groups, setGroups] = useState(user?.groups || [])

    const [availableGroups, setAvailableGroups] = useState([])
    useEffect(() => {
        ; (async () => {
            const gs = await http(`/api/data/group`)
            setAvailableGroups(gs)
        })().catch(console.error)
    }, [])

    const submit = (e) => {
        e && e.preventDefault()
        const payload = {
            ...user,
            name,
            email,
            title,
            description,
            groups,
            ...(password ? { password } : {}),
        }
        onSave(payload)
    }

    return (
        <div class="modal-backdrop">
            <div class="card modal" style={{ padding: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 10 }}>{mode === 'add' ? 'Add' : 'Edit'} User</div>
                <form onSubmit={submit}>
                    <div class="form-group">
                        <div class="label">Name</div>
                        <input class="input" value={name} onInput={(e) => setName(e.currentTarget.value)} required />
                    </div>
                    <div class="form-group">
                        <div class="label">Email</div>
                        <input class="input" type="email" value={email} onInput={(e) => setEmail(e.currentTarget.value)} required />
                    </div>
                    <div class="row">
                        <div class="form-group" style={{ flex: 1 }}>
                            <div class="label">Title</div>
                            <input class="input" value={title} onInput={(e) => setTitle(e.currentTarget.value)} />
                        </div>
                        <div class="form-group" style={{ flex: 1 }}>
                            <div class="label">Password {mode === 'edit' ? <span class="label">(leave blank to keep)</span> : null}</div>
                            <input class="input" type="password" value={password} onInput={(e) => setPassword(e.currentTarget.value)} />
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="label">Description</div>
                        <input class="input" value={description} onInput={(e) => setDescription(e.currentTarget.value)} />
                    </div>

                    <div class="form-group">
                        <div class="label">Groups</div>
                        <div class="row" style={{ flexWrap: 'wrap' }}>
                            {availableGroups.map((g) => {
                                const checked = groups.includes(g.name)
                                return (
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 8 }}>
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={async (e) => {
                                                const isChecked = e.currentTarget.checked
                                                let next = groups
                                                if (isChecked) next = [...groups, g.name]
                                                else next = groups.filter((x) => x !== g.name)
                                                setGroups(next)
                                                if (user?.userId) {
                                                    await http(`/api/security/membership/${user.userId}/${g.securityGroupId}`, { method: isChecked ? 'POST' : 'DELETE' })
                                                    await refresh()
                                                }
                                            }}
                                        />
                                        <span>{g.name}</span>
                                    </label>
                                )
                            })}
                        </div>
                    </div>

                    <div class="form-actions">
                        <button class="btn" type="button" onClick={onClose}>Cancel</button>
                        <button class="btn primary" type="submit">Save</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function GroupsPanel({ http, organizationId }) {
    const [groups, setGroups] = useState([])
    const [modal, setModal] = useState(null)
    const [membersModal, setMembersModal] = useState(null)

    const refresh = async () => {
        const list = await http(`/api/data/group?organizationId=${encodeURIComponent(organizationId)}`)
        setGroups(list)
    }

    useEffect(() => {
        refresh().catch(console.error)
    }, [organizationId])

    const upsert = async (group) => {
        if (group.securityGroupId) {
            const updated = await http(`/api/data/group/${group.securityGroupId}`, { method: 'PUT', body: JSON.stringify(group) })
            setGroups((list) => list.map((x) => (x.securityGroupId === updated.securityGroupId ? updated : x)))
        } else {
            const created = await http(`/api/data/group`, { method: 'POST', body: JSON.stringify({ ...group, organizationId }) })
            setGroups((list) => [...list, created])
        }
    }

    const remove = async (groupId) => {
        await http(`/api/data/group/${groupId}`, { method: 'DELETE' })
        setGroups((list) => list.filter((x) => x.securityGroupId !== groupId))
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ color: 'var(--muted)' }}>{groups.length} groups</div>
                <button class="btn" onClick={() => setModal({ mode: 'add', group: { name: '', description: '' } })}>Add Group</button>
            </div>
            <table class="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Users</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {groups.map((g) => (
                        <tr key={g.securityGroupId}>
                            <td>{g.name}</td>
                            <td>{g.description}</td>
                            <td style={{ color: 'var(--muted)' }}>{g.users?.length ?? 0}</td>
                            <td style={{ textAlign: 'right' }}>
                                <div class="row" style={{ justifyContent: 'flex-end' }}>
                                    <button class="btn" onClick={() => setModal({ mode: 'edit', group: g })}>Edit</button>
                                    <button class="btn" onClick={() => setMembersModal(g)}>Members</button>
                                    <button class="btn danger" onClick={() => remove(g.securityGroupId)}>Delete</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {modal ? (
                <GroupModal
                    mode={modal.mode}
                    group={modal.group}
                    onClose={() => setModal(null)}
                    onSave={async (data) => {
                        await upsert(data)
                        setModal(null)
                    }}
                />
            ) : null}

            {membersModal ? (
                <GroupMembersModal http={http} group={membersModal} onClose={() => setMembersModal(null)} />
            ) : null}
        </div>
    )
}

function GroupModal({ mode, group, onClose, onSave }) {
    const [name, setName] = useState(group?.name || '')
    const [description, setDescription] = useState(group?.description || '')

    const submit = (e) => {
        e && e.preventDefault()
        onSave({ ...group, name, description })
    }

    return (
        <div class="modal-backdrop">
            <div class="card modal" style={{ padding: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 10 }}>{mode === 'add' ? 'Add' : 'Edit'} Group</div>
                <form onSubmit={submit}>
                    <div class="form-group">
                        <div class="label">Name</div>
                        <input class="input" value={name} onInput={(e) => setName(e.currentTarget.value)} required />
                    </div>
                    <div class="form-group">
                        <div class="label">Description</div>
                        <input class="input" value={description} onInput={(e) => setDescription(e.currentTarget.value)} />
                    </div>
                    <div class="form-actions">
                        <button class="btn" type="button" onClick={onClose}>Cancel</button>
                        <button class="btn primary" type="submit">Save</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function GroupMembersModal({ http, group, onClose }) {
    const [users, setUsers] = useState([])
    const [availableUsers, setAvailableUsers] = useState([])
    const [busy, setBusy] = useState(false)

    useEffect(() => {
        ; (async () => {
            const allUsers = await http(`/api/data/user?organizationId=${encodeURIComponent(group.organizationId)}`)
            setAvailableUsers(allUsers)
            setUsers(allUsers.filter((u) => (group.users || []).includes(u.email)))
        })().catch(console.error)
    }, [group.organizationId])

    const addUser = async (userId) => {
        setBusy(true)
        try {
            await http(`/api/security/membership/${userId}/${group.securityGroupId}`, { method: 'POST' })
            const u = availableUsers.find((x) => x.userId === userId)
            if (u) setUsers((list) => [...list, u])
        } finally {
            setBusy(false)
        }
    }

    const removeUser = async (userId) => {
        setBusy(true)
        try {
            await http(`/api/security/membership/${userId}/${group.securityGroupId}`, { method: 'DELETE' })
            setUsers((list) => list.filter((x) => x.userId !== userId))
        } finally {
            setBusy(false)
        }
    }

    return (
        <div class="modal-backdrop">
            <div class="card modal" style={{ padding: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 10 }}>Members: {group.name}</div>
                <div class="row" style={{ gap: 16 }}>
                    <div style={{ flex: 1 }}>
                        <div class="label">Current Members</div>
                        <ul>
                            {users.map((u) => (
                                <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
                                    <span>{u.name} <span class="label">({u.email})</span></span>
                                    <button class="btn danger" disabled={busy} onClick={() => removeUser(u.userId)}>Remove</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div class="label">Add User</div>
                        <select class="input" onChange={(e) => addUser(e.currentTarget.value)} disabled={busy}>
                            <option value="">Select user...</option>
                            {availableUsers
                                .filter((u) => !users.some((x) => x.userId === u.userId))
                                .map((u) => (
                                    <option value={u.userId}>{u.name} ({u.email})</option>
                                ))}
                        </select>
                    </div>
                </div>

                <div class="form-actions" style={{ marginTop: 16 }}>
                    <button class="btn" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    )
}