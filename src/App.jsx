import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

import ContactList from "./components/ContactList";
import ContactForm from "./components/ContactForm";
import ContactDetails from "./components/ContactDetails";
import DeleteModal from "./components/DeleteModal";

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
  const [categoryFilter, setCategoryFilter] =
    useState("All");
  const [roleFilter, setRoleFilter] =
    useState("All");
  const [showFavoritesOnly, setShowFavoritesOnly] =
    useState(false);
  const [sortBy, setSortBy] = useState("recent");

  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] =
    useState(null);
  const [selectedContact, setSelectedContact] =
    useState(null);
  const [contactToDelete, setContactToDelete] =
    useState(null);

  const [importMessage, setImportMessage] =
    useState("");

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    category: "College",
    email: "",
    phone: "",
  });

  /* -----------------------------
     ROLES
  ----------------------------- */

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

  /* -----------------------------
     FILTERING + SORTING
  ----------------------------- */

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
        (contact) =>
          contact.category === categoryFilter
      );
    }

    if (roleFilter !== "All") {
      result = result.filter(
        (contact) =>
          contact.role === roleFilter
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

  /* -----------------------------
     STATISTICS
  ----------------------------- */

  const favoriteCount = contacts.filter(
    (contact) => contact.favorite
  ).length;

  const uniqueCategories = new Set(
    contacts.map(
      (contact) => contact.category
    )
  ).size;

  const favoritePercentage =
    contacts.length > 0
      ? Math.round(
          (favoriteCount / contacts.length) * 100
        )
      : 0;

  /* -----------------------------
     ADD CONTACT
  ----------------------------- */

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

  /* -----------------------------
     EDIT CONTACT
  ----------------------------- */

  const openEditModal = (contact) => {
    setEditingContact(contact);

    setFormData({
      name: contact.name,
      role: contact.role,
      category:
        contact.category || "Personal",
      email: contact.email,
      phone: contact.phone || "",
    });

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingContact(null);
  };

  /* -----------------------------
     SAVE CONTACT
  ----------------------------- */

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

  /* -----------------------------
     FAVORITE
  ----------------------------- */

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
      if (
        !previous ||
        previous.id !== id
      ) {
        return previous;
      }

      return {
        ...previous,
        favorite: !previous.favorite,
      };
    });
  };

  /* -----------------------------
     DETAILS
  ----------------------------- */

  const openDetails = (contact) => {
    setSelectedContact(contact);
  };

  const closeDetails = () => {
    setSelectedContact(null);
  };

  /* -----------------------------
     DELETE
  ----------------------------- */

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
          contact.id !==
          contactToDelete.id
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

  /* -----------------------------
     CLEAR FILTERS
  ----------------------------- */

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("All");
    setRoleFilter("All");
    setShowFavoritesOnly(false);
  };

  /* -----------------------------
     EXPORT
  ----------------------------- */

  const exportContacts = () => {
    const data = JSON.stringify(
      contacts,
      null,
      2
    );

    const blob = new Blob([data], {
      type: "application/json",
    });

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "contact-hub-contacts.json";

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

  /* -----------------------------
     IMPORT
  ----------------------------- */

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
          throw new Error(
            "Invalid file"
          );
        }

        const validContacts =
          imported.filter(
            (contact) =>
              contact &&
              contact.name &&
              contact.email &&
              contact.role
          );

        setContacts((previous) => {
          const existingEmails =
            new Set(
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

                phone:
                  contact.phone || "",

                category:
                  contact.category ||
                  "Personal",

                favorite:
                  Boolean(
                    contact.favorite
                  ),
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

  /* -----------------------------
     UI
  ----------------------------- */

  return (
    <div className="app-shell">
      {/* Background */}

      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <div className="aurora aurora-three" />

      <div className="sparkle sparkle-one">
        ✦
      </div>

      <div className="sparkle sparkle-two">
        ✧
      </div>

      <div className="sparkle sparkle-three">
        ✦
      </div>

      <div className="sparkle sparkle-four">
        ✧
      </div>

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
          <span className="button-plus">
            +
          </span>

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
              <span>
                every connection.
              </span>
            </h2>

            <p>
              Manage your connections,
              discover important people
              faster, and keep everything
              beautifully organized.
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
            <div className="stat-icon">
              ◎
            </div>

            <div>
              <span>
                Total Contacts
              </span>

              <strong>
                {contacts.length}
              </strong>

              <small>
                People in your hub
              </small>
            </div>
          </div>

          <div className="stat-card stat-pink">
            <div className="stat-icon">
              ♥
            </div>

            <div>
              <span>
                Favorites
              </span>

              <strong>
                {favoriteCount}
              </strong>

              <small>
                Your important people
              </small>
            </div>
          </div>

          <div className="stat-card stat-blue">
            <div className="stat-icon">
              ◇
            </div>

            <div>
              <span>
                Categories
              </span>

              <strong>
                {uniqueCategories}
              </strong>

              <small>
                Different groups
              </small>
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
                A quick overview of how
                your connections are
                organized.
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
                <span>
                  Favorite Rate
                </span>

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
                <span>
                  Network Size
                </span>

                <span className="insight-icon">
                  ◎
                </span>
              </div>

              <div className="insight-number">
                {contacts.length}
              </div>

              <p>
                Total people currently
                saved in your ContactHub.
              </p>
            </div>

            {/* Categories */}

            <div className="insight-card category-insight">
              <div className="insight-card-top">
                <span>
                  Categories
                </span>

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
                                contacts.length
                                  ? (count /
                                      contacts.length) *
                                    100
                                  : 0
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
                  setSearch(
                    event.target.value
                  )
                }
              />

              {search && (
                <button
                  className="clear-search"
                  onClick={() =>
                    setSearch("")
                  }
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
                  (previous) =>
                    !previous
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
                setSortBy(
                  event.target.value
                )
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
              <span>
                Active filters
              </span>

              {search && (
                <button
                  onClick={() =>
                    setSearch("")
                  }
                >
                  Search: {search} ×
                </button>
              )}

              {categoryFilter !==
                "All" && (
                <button
                  onClick={() =>
                    setCategoryFilter(
                      "All"
                    )
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
                    setShowFavoritesOnly(
                      false
                    )
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

          {/* CONTACT LIST */}

          {filteredContacts.length >
          0 ? (
            <ContactList
              contacts={filteredContacts}
              toggleFavorite={
                toggleFavorite
              }
              openEditModal={
                openEditModal
              }
              openDetails={
                openDetails
              }
              askDeleteContact={
                askDeleteContact
              }
            />
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                ⌕
              </div>

              <h3>
                No connections found
              </h3>

              <p>
                Try changing your
                filters or search for
                something else.
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
              Beautifully organized
              connections.
            </small>
          </div>
        </div>

        <p>
          Built with React • Your data
          stays in your browser.
        </p>
      </footer>

      {/* ADD / EDIT */}

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
                  Keep your contact
                  information beautifully
                  organized.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={closeForm}
              >
                ×
              </button>
            </div>

            <ContactForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={saveContact}
              onCancel={closeForm}
              isEditing={Boolean(
                editingContact
              )}
            />
          </div>
        </div>
      )}

      {/* CONTACT DETAILS */}

      {selectedContact && (
        <ContactDetails
          contact={selectedContact}
          onClose={closeDetails}
          onEdit={(contact) => {
            openEditModal(contact);
            setSelectedContact(null);
             openEditModal(contact);
          }}
          onDelete={(contact) => {
            setSelectedContact(null);
            askDeleteContact(contact);
            
          }}
        />
      )}

      {/* DELETE */}

      {contactToDelete && (
        <DeleteModal
          contact={contactToDelete}
          onConfirm={confirmDelete}
          onCancel={() =>
            setContactToDelete(null)
          }
        />
      )}
    </div>
  );
}

export default App;