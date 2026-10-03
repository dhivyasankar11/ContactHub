function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function ContactCard({
  contact,
  toggleFavorite,
  openEditModal,
  openDetails,
  askDeleteContact,
}) {
  return (
    <article className="contact-card">
      <div className="card-glow"></div>

      <div className="card-header">
        <div className="avatar">
          {getInitials(contact.name)}
        </div>

        <button
          type="button"
          className={`favorite-button ${
            contact.favorite ? "active" : ""
          }`}
          onClick={(event) => {
            event.stopPropagation();
            toggleFavorite(contact.id);
          }}
          title={
            contact.favorite
              ? "Remove from favorites"
              : "Add to favorites"
          }
        >
          {contact.favorite ? "★" : "☆"}
        </button>
      </div>

      <div className="card-body">
        <h3>{contact.name}</h3>

        <p className="contact-role">
          {contact.role}
        </p>

        <span className="category-pill">
          {contact.category || "Personal"}
        </span>

        <div className="contact-details">
          <div>
            <span>✉</span>
            <span>{contact.email}</span>
          </div>

          <div>
            <span>☎</span>
            <span>
              {contact.phone || "No phone"}
            </span>
          </div>
        </div>
      </div>

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
            type="button"
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
            type="button"
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
            type="button"
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
          type="button"
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
  );
}

export default ContactCard;