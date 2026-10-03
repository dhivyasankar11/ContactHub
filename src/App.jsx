import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const CATEGORY_OPTIONS = [
  "College",
  "Work",
  "Friends",
  "Family",
  "Professional",
  "Personal",
];

const INITIAL_CONTACTS = [
  {
    id: 1,
    name: "Dhivya Sankar",
    role: "Web Developer",
    email: "dhivya@example.com",
    phone: "+91 98765 43210",
    category: "College",
    favorite: true,
  },
  {
    id: 2,
    name: "Arun Kumar",
    role: "Software Developer",
    email: "arun@example.com",
    phone: "+91 98765 12345",
    category: "Work",
    favorite: false,
  },
  {
    id: 3,
    name: "Priya S",
    role: "UI/UX Designer",
    email: "priya@example.com",
    phone: "+91 98765 67890",
    category: "Friends",
    favorite: true,
  },
  {
    id: 4,
    name: "Rahul M",
    role: "Frontend Developer",
    email: "rahul@example.com",
    phone: "+91 98765 11223",
    category: "Professional",
    favorite: false,
  },
];

function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function App() {
  const fileInputRef = useRef(null);

  const [contacts, setContacts] = useState(() => {
    const saved = localStorage.getItem("contactHubContacts");

    if (!saved) {
      return INITIAL_CONTACTS;
    }

    try {
      const parsed = JSON.parse(saved);

      if (!Array.isArray(parsed)) {
        return INITIAL_CONTACTS;
      }

      return parsed.map((contact) => ({
        ...contact,
        category: contact.category || "Personal",
        phone: contact.phone || "",
        favorite: Boolean(contact.favorite),
      }));
    } catch {
      return INITIAL_CONTACTS;
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "contactHubContacts",
      JSON.stringify(contacts)
    );
  }, [contacts]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState("recent");

  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [contactToDelete, setContactToDelete] = useState(null);

  const [importMessage, setImportMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    category: "College",
    email: "",
    phone: "",
  });

  const roles = useMemo(() => {
    const uniqueRoles = [
      ...new Set(
        contacts
          .map((contact) => contact.role)
          .filter(Boolean)
      ),
    ];

    return ["All", ...uniqueRoles];
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    let result = [...contacts];

    const query = search.trim().toLowerCase();

    if (query) {
      result = result.filter((contact) =>
        [
          contact.name,
          contact.email,
          contact.role,
          contact.category,
          contact.phone,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)
      );
    }

    if (categoryFilter !== "All") {
      result = result.filter(
        (contact) => contact.category === categoryFilter
      );
    }

    if (roleFilter !== "All") {
      result = result.filter(
        (contact) => contact.role === roleFilter
      );
    }

    if (showFavoritesOnly) {
      result = result.filter(
        (contact) => contact.favorite
      );
    }

    if (sortBy === "name") {
      result.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    if (sortBy === "role") {
      result.sort((a, b) =>
        a.role.localeCompare(b.role)
      );
    }

    if (sortBy === "recent") {
      result.sort((a, b) => b.id - a.id);
    }

    return result;
  }, [
    contacts,
    search,
    categoryFilter,
    roleFilter,
    showFavoritesOnly,
    sortBy,
  ]);

  const favoriteCount = contacts.filter(
    (contact) => contact.favorite
  ).length;

  const uniqueCategories = new Set(
    contacts.map((contact) => contact.category)
  ).size;

  const favoritePercentage =
    contacts.length > 0
      ? Math.round(
          (favoriteCount / contacts.length) * 100
        )
      : 0;

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openAddModal = () => {
    setEditingContact(null);

    setFormData({
      name: "",
      role: "",
      category: "College",
      email: "",
      phone: "",
    });

    setShowForm(true);
  };

  const openEditModal = (contact) => {
    setEditingContact(contact);

    setFormData({
      name: contact.name,
      role: contact.role,
      category: contact.category || "Personal",
      email: contact.email,
      phone: contact.phone || "",
    });

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingContact(null);
  };

  const saveContact = (event) => {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.role.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim()
    ) {
      return;
    }

    if (editingContact) {
      const updatedContact = {
        ...editingContact,
        ...formData,
      };

      setContacts((previous) =>
        previous.map((contact) =>
          contact.id === editingContact.id
            ? updatedContact
            : contact
        )
      );

      if (
        selectedContact?.id ===
        editingContact.id
      ) {
        setSelectedContact(updatedContact);
      }
    } else {
      const newContact = {
        id: Date.now(),
        ...formData,
        favorite: false,
      };

      setContacts((previous) => [
        newContact,
        ...previous,
      ]);
    }

    closeForm();
  };

  const toggleFavorite = (id) => {
    setContacts((previous) =>
      previous.map((contact) =>
        contact.id === id
          ? {
              ...contact,
              favorite: !contact.favorite,
            }
          : contact
      )
    );

    setSelectedContact((previous) => {
      if (!previous || previous.id !== id) {
        return previous;
      }

      return {
        ...previous,
        favorite: !previous.favorite,
      };
    });
  };

  const openDetails = (contact) => {
    setSelectedContact(contact);
  };

  const closeDetails = () => {
    setSelectedContact(null);
  };

  const askDeleteContact = (contact) => {
    setContactToDelete(contact);
  };

  const confirmDelete = () => {
    if (!contactToDelete) {
      return;
    }

    setContacts((previous) =>
      previous.filter(
        (contact) =>
          contact.id !== contactToDelete.id
      )
    );

    if (
      selectedContact?.id ===
      contactToDelete.id
    ) {
      setSelectedContact(null);
    }

    setContactToDelete(null);
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("All");
    setRoleFilter("All");
    setShowFavoritesOnly(false);
  };

  const exportContacts = () => {
    const data = JSON.stringify(
      contacts,
      null,
      2
    );

    const blob = new Blob([data], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "contact-hub-contacts.json";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    setImportMessage(
      "Contacts exported successfully."
    );

    setTimeout(() => {
      setImportMessage("");
    }, 3000);
  };

  const openImportFile = () => {
    fileInputRef.current?.click();
  };

  const handleImport = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = (loadEvent) => {
      try {
        const imported = JSON.parse(
          loadEvent.target.result
        );

        if (!Array.isArray(imported)) {
          throw new Error("Invalid file");
        }

        const validContacts = imported.filter(
          (contact) =>
            contact &&
            contact.name &&
            contact.email &&
            contact.role
        );

        setContacts((previous) => {
          const existingEmails = new Set(
            previous.map((contact) =>
              contact.email.toLowerCase()
            )
          );

          const newContacts =
            validContacts
              .filter(
                (contact) =>
                  !existingEmails.has(
                    contact.email.toLowerCase()
                  )
              )
              .map((contact) => ({
                id:
                  Date.now() +
                  Math.random(),
                name: contact.name,
                role: contact.role,
                email: contact.email,
                phone: contact.phone || "",
                category:
                  contact.category ||
                  "Personal",
                favorite:
                  Boolean(contact.favorite),
              }));

          return [
            ...newContacts,
            ...previous,
          ];
        });

        setImportMessage(
          `${validContacts.length} contact(s) imported successfully.`
        );
      } catch {
        setImportMessage(
          "Unable to import this file."
        );
      }

      setTimeout(() => {
        setImportMessage("");
      }, 3500);
    };

    reader.readAsText(file);

    event.target.value = "";
  };

  return (
    <div className="app-shell">
      {/* Background */}
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <div className="aurora aurora-three" />

      <div className="sparkle sparkle-one">✦</div>
      <div className="sparkle sparkle-two">✧</div>
      <div className="sparkle sparkle-three">✦</div>
      <div className="sparkle sparkle-four">✧</div>

      {/* Header */}
      <header className="topbar">
        <div className="brand-area">
          <div className="brand-mark">
            <span>✦</span>
          </div>

          <div>
            <h1>
              Contact<span>Hub</span>
            </h1>

            <p>
              Your people, beautifully organized.
            </p>
          </div>
        </div>

        <button
          className="add-contact-button"
          onClick={openAddModal}
        >
          <span className="button-plus">+</span>
          Add Contact
        </button>
      </header>

      <main className="main-content">
        {/* Hero */}
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              PERSONAL CONTACT SPACE
            </div>
<h2>
  One hub for
  <br />
  <span>every connection.</span>
</h2>

            <p>
              Manage your connections, discover
              important people faster, and keep
              everything beautifully organized.
            </p>
          </div>

          <div className="hero-decoration">
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />

            <div className="hero-center">
              <div className="hero-center-icon">
                ♡
              </div>

              <strong>
                {contacts.length}
              </strong>

              <span>Connections</span>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="stats-grid">
          <div className="stat-card stat-purple">
            <div className="stat-icon">◎</div>

            <div>
              <span>Total Contacts</span>
              <strong>{contacts.length}</strong>
              <small>People in your hub</small>
            </div>
          </div>

          <div className="stat-card stat-pink">
            <div className="stat-icon">♥</div>

            <div>
              <span>Favorites</span>
              <strong>{favoriteCount}</strong>
              <small>Your important people</small>
            </div>
          </div>

          <div className="stat-card stat-blue">
            <div className="stat-icon">◇</div>

            <div>
              <span>Categories</span>
              <strong>{uniqueCategories}</strong>
              <small>Different groups</small>
            </div>
          </div>
        </section>

        {/* Insights */}
        <section className="insights-section">
          <div className="insights-heading">
            <div>
              <div className="section-label">
                CONTACT INSIGHTS
              </div>

              <h3>
                Your network at a glance
              </h3>

              <p>
                A quick overview of how your
                connections are organized.
              </p>
            </div>

            <div className="insights-badge">
              ✦ Live Overview
            </div>
          </div>

          <div className="insights-grid">
            {/* Favorite Rate */}
            <div className="insight-card">
              <div className="insight-card-top">
                <span>Favorite Rate</span>
                <span className="insight-icon">
                  ♥
                </span>
              </div>

              <div className="insight-number">
                {favoritePercentage}
                <small>%</small>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${favoritePercentage}%`,
                  }}
                />
              </div>

              <p>
                {favoriteCount} favorite
                {favoriteCount !== 1
                  ? "s"
                  : ""}{" "}
                out of {contacts.length}{" "}
                contacts
              </p>
            </div>

            {/* Network Size */}
            <div className="insight-card">
              <div className="insight-card-top">
                <span>Network Size</span>

                <span className="insight-icon">
                  ◎
                </span>
              </div>

              <div className="insight-number">
                {contacts.length}
              </div>

              <p>
                Total people currently saved
                in your ContactHub.
              </p>
            </div>

            {/* Categories */}
            <div className="insight-card category-insight">
              <div className="insight-card-top">
                <span>Categories</span>

                <span className="insight-icon">
                  ◇
                </span>
              </div>

              <div className="category-bars">
                {CATEGORY_OPTIONS.map(
                  (category) => {
                    const count =
                      contacts.filter(
                        (contact) =>
                          contact.category ===
                          category
                      ).length;

                    if (count === 0) {
                      return null;
                    }

                    return (
                      <div
                        className="category-bar-row"
                        key={category}
                      >
                        <div className="category-bar-label">
                          <span>
                            {category}
                          </span>

                          <strong>
                            {count}
                          </strong>
                        </div>

                        <div className="mini-bar">
                          <div
                            style={{
                              width: `${
                                (count /
                                  contacts.length) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Directory */}
        <section className="workspace">
          <div className="workspace-header">
            <div>
              <div className="section-label">
                CONTACT DIRECTORY
              </div>

              <h3>
                Your connections
                <span>
                  {filteredContacts.length}
                </span>
              </h3>
            </div>

            <div className="data-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                hidden
                onChange={handleImport}
              />

              <button
                className="soft-action"
                onClick={openImportFile}
              >
                ↓ Import
              </button>

              <button
                className="soft-action"
                onClick={exportContacts}
              >
                ↑ Export
              </button>
            </div>
          </div>

          {importMessage && (
            <div className="import-message">
              <span>✓</span>
              {importMessage}
            </div>
          )}

          {/* Filters */}
          <div className="filter-panel">
            <div className="search-wrapper">
              <span className="search-icon">
                ⌕
              </span>

              <input
                type="text"
                placeholder="Search people, roles, emails..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

              {search && (
                <button
                  className="clear-search"
                  onClick={() => setSearch("")}
                >
                  ×
                </button>
              )}
            </div>

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value
                )
              }
            >
              <option value="All">
                All Categories
              </option>

              {CATEGORY_OPTIONS.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                )
              )}
            </select>

            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(
                  event.target.value
                )
              }
            >
              {roles.map((role) => (
                <option
                  key={role}
                  value={role}
                >
                  {role === "All"
                    ? "All Roles"
                    : role}
                </option>
              ))}
            </select>

            <button
              className={`favorite-filter ${
                showFavoritesOnly
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setShowFavoritesOnly(
                  (previous) => !previous
                )
              }
            >
              <span>♥</span>
              Favorites
            </button>

            <select
              className="sort-select"
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value)
              }
            >
              <option value="recent">
                Recently Added
              </option>

              <option value="name">
                Name A–Z
              </option>

              <option value="role">
                Role A–Z
              </option>
            </select>
          </div>

          {/* Active filters */}
          {(search ||
            categoryFilter !== "All" ||
            roleFilter !== "All" ||
            showFavoritesOnly) && (
            <div className="active-filters">
              <span>Active filters</span>

              {search && (
                <button
                  onClick={() => setSearch("")}
                >
                  Search: {search} ×
                </button>
              )}

              {categoryFilter !== "All" && (
                <button
                  onClick={() =>
                    setCategoryFilter("All")
                  }
                >
                  {categoryFilter} ×
                </button>
              )}

              {roleFilter !== "All" && (
                <button
                  onClick={() =>
                    setRoleFilter("All")
                  }
                >
                  {roleFilter} ×
                </button>
              )}

              {showFavoritesOnly && (
                <button
                  onClick={() =>
                    setShowFavoritesOnly(false)
                  }
                >
                  Favorites ×
                </button>
              )}

              <button
                className="clear-all"
                onClick={clearFilters}
              >
                Clear all
              </button>
            </div>
          )}

          {/* Contact cards */}
          {filteredContacts.length > 0 ? (
            <div className="contacts-grid">
              {filteredContacts.map(
                (contact, index) => (
                  <article
                    className="contact-card"
                    key={contact.id}
                    style={{
                      "--card-delay": `${
                        index * 70
                      }ms`,
                    }}
                    onClick={() =>
                      openDetails(contact)
                    }
                  >
                    <div className="card-glow" />

                    <div className="card-header">
                      <div
                        className={`avatar avatar-${
                          index % 6
                        }`}
                      >
                        {getInitials(
                          contact.name
                        )}
                      </div>

                      <div className="card-top-buttons">
                        <button
                          className={`favorite-button ${
                            contact.favorite
                              ? "liked"
                              : ""
                          }`}
                          onClick={(event) => {
                            event.stopPropagation();

                            toggleFavorite(
                              contact.id
                            );
                          }}
                          title="Favorite"
                        >
                          {contact.favorite
                            ? "♥"
                            : "♡"}
                        </button>

                        <button
                          className="more-button"
                          onClick={(event) => {
                            event.stopPropagation();

                            openEditModal(
                              contact
                            );
                          }}
                          title="Edit"
                        >
                          ⋯
                        </button>
                      </div>
                    </div>

                    <div className="card-body">
                      <div className="name-row">
                        <h4>{contact.name}</h4>

                        {contact.favorite && (
                          <span className="tiny-star">
                            ✦
                          </span>
                        )}
                      </div>

                      <p className="role">
                        {contact.role}
                      </p>

                      <span
                        className={`category-pill category-${contact.category.toLowerCase()}`}
                      >
                        {contact.category}
                      </span>

                      <div className="contact-details">
                        <div className="contact-detail-row">
                          <span className="detail-icon">
                            @
                          </span>

                          <span
                            className="detail-text"
                            title={contact.email}
                          >
                            {contact.email}
                          </span>
                        </div>

                        <div className="contact-detail-row">
                          <span className="detail-icon">
                            ☎
                          </span>

                          <span
                            className="detail-text"
                            title={contact.phone}
                          >
                            {contact.phone}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick actions */}
                    <div className="card-footer">
  <div className="quick-actions">
    <a
      href={`mailto:${contact.email}`}
      className="quick-action email-action"
      onClick={(event) =>
        event.stopPropagation()
      }
      title="Send email"
    >
      ✉
    </a>

    <a
      href={`tel:${contact.phone}`}
      className="quick-action call-action"
      onClick={(event) =>
        event.stopPropagation()
      }
      title="Call contact"
    >
      ☎
    </a>

    <button
      className="quick-action edit-action"
      onClick={(event) => {
        event.stopPropagation();

        openEditModal(contact);
      }}
      title="Edit contact"
    >
      ✎
    </button>

    <button
      className="quick-action view-action"
      onClick={(event) => {
        event.stopPropagation();

        openDetails(contact);
      }}
      title="View contact"
    >
      →
    </button>

    <button
      className="quick-action delete-action"
      onClick={(event) => {
        event.stopPropagation();

        askDeleteContact(contact);
      }}
      title="Delete contact"
    >
      🗑
    </button>
  </div>

  <button
    className="view-profile-button"
    onClick={(event) => {
      event.stopPropagation();

      openDetails(contact);
    }}
  >
    View Profile
    <span>→</span>
  </button>
</div>
                  </article>
                )
              )}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                ⌕
              </div>

              <h3>
                No connections found
              </h3>

              <p>
                Try changing your filters or
                search for something else.
              </p>

              <button
                onClick={clearFilters}
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-brand">
          <div className="footer-mark">
            ✦
          </div>

          <div>
            <strong>
              Contact<span>Hub</span>
            </strong>

            <small>
              Beautifully organized connections.
            </small>
          </div>
        </div>

        <p>
          Built with React • Your data stays
          in your browser.
        </p>
      </footer>

      {/* Add / Edit Modal */}
      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={closeForm}
        >
          <div
            className="form-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-heading">
              <div>
                <span className="modal-kicker">
                  CONTACT
                </span>

                <h3>
                  {editingContact
                    ? "Edit connection"
                    : "Add a new connection"}
                </h3>

                <p>
                  Keep your contact information
                  beautifully organized.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={closeForm}
              >
                ×
              </button>
            </div>

            <form onSubmit={saveContact}>
              <div className="form-avatar-preview">
                {formData.name
                  ? getInitials(formData.name)
                  : "?"}
              </div>

              <div className="form-grid">
                <label>
                  Full Name

                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Dhivya Sankar"
                    required
                  />
                </label>

                <label>
                  Role

                  <input
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    placeholder="e.g. Web Developer"
                    required
                  />
                </label>

                <label>
                  Category

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    {CATEGORY_OPTIONS.map(
                      (category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label>
                  Email Address

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@example.com"
                    required
                  />
                </label>

                <label className="full-width">
                  Phone Number

                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                    required
                  />
                </label>
              </div>

              <div className="form-buttons">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                >
                  {editingContact
                    ? "Save Changes"
                    : "Create Contact"}

                  <span>→</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedContact && (
        <div
          className="modal-backdrop"
          onMouseDown={closeDetails}
        >
          <div
            className="details-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="details-close"
              onClick={closeDetails}
            >
              ×
            </button>

            <div className="details-top">
              <div className="details-avatar">
                {getInitials(
                  selectedContact.name
                )}
              </div>

              <div>
                <span className="modal-kicker">
                  CONTACT PROFILE
                </span>

                <h3>
                  {selectedContact.name}
                </h3>

                <p>
                  {selectedContact.role}
                </p>
              </div>

              <button
                className={`details-heart ${
                  selectedContact.favorite
                    ? "liked"
                    : ""
                }`}
                onClick={() =>
                  toggleFavorite(
                    selectedContact.id
                  )
                }
              >
                {selectedContact.favorite
                  ? "♥"
                  : "♡"}
              </button>
            </div>

            <div
              className={`large-category category-${selectedContact.category.toLowerCase()}`}
            >
              {selectedContact.category}
            </div>

            <div className="details-list">
              <div className="details-row">
                <span className="row-icon">
                  @
                </span>

                <div>
                  <small>Email</small>

                  <strong>
                    {selectedContact.email}
                  </strong>
                </div>
              </div>

              <div className="details-row">
                <span className="row-icon">
                  ☎
                </span>

                <div>
                  <small>Phone</small>

                  <strong>
                    {selectedContact.phone}
                  </strong>
                </div>
              </div>

              <div className="details-row">
                <span className="row-icon">
                  ◇
                </span>

                <div>
                  <small>Role</small>

                  <strong>
                    {selectedContact.role}
                  </strong>
                </div>
              </div>
            </div>

            <div className="details-actions">
              <a
                href={`mailto:${selectedContact.email}`}
                className="primary-detail-button"
              >
                ✉ Send Email
              </a>

              <a
                href={`tel:${selectedContact.phone}`}
                className="secondary-detail-button"
              >
                ☎ Call
              </a>
            </div>

            <div className="details-management">
              <button
                onClick={() => {
                  openEditModal(
                    selectedContact
                  );

                  setSelectedContact(null);
                }}
              >
                ✎ Edit Contact
              </button>

              <button
                className="danger-button"
                onClick={() =>
                  askDeleteContact(
                    selectedContact
                  )
                }
              >
                ♢ Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {contactToDelete && (
        <div
          className="modal-backdrop"
          onMouseDown={() =>
            setContactToDelete(null)
          }
        >
          <div
            className="delete-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="delete-icon">
              !
            </div>

            <h3>
              Delete connection?
            </h3>

            <p>
              Are you sure you want to remove{" "}
              <strong>
                {contactToDelete.name}
              </strong>{" "}
              from your contact hub?
            </p>

            <div className="delete-buttons">
              <button
                onClick={() =>
                  setContactToDelete(null)
                }
              >
                Keep Contact
              </button>

              <button
                className="confirm-delete"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;