function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function ContactDetails({
  contact,
  onClose,
  onEdit,
  onDelete,
}) {
  if (!contact) {
    return null;
  }

  return (
    <div
      className="details-overlay"
      onClick={onClose}
    >
      <div
        className="details-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="details-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="details-avatar">
          {getInitials(contact.name)}
        </div>

        <h2>{contact.name}</h2>

        <p className="details-role">
          {contact.role}
        </p>

        <span className="category-pill">
          {contact.category || "Personal"}
        </span>

        <div className="details-list">
          <div className="detail-item">
            <span className="detail-icon">✉</span>

            <div>
              <small>Email</small>
              <p>{contact.email}</p>
            </div>
          </div>

          <div className="detail-item">
            <span className="detail-icon">☎</span>

            <div>
              <small>Phone</small>
              <p>{contact.phone || "Not provided"}</p>
            </div>
          </div>

          <div className="detail-item">
            <span className="detail-icon">💼</span>

            <div>
              <small>Role</small>
              <p>{contact.role}</p>
            </div>
          </div>

          <div className="detail-item">
            <span className="detail-icon">🏷</span>

            <div>
              <small>Category</small>
              <p>{contact.category || "Personal"}</p>
            </div>
          </div>
        </div>

        <div className="details-actions">
          <a
            href={`mailto:${contact.email}`}
            className="details-action email-action"
          >
            ✉ Send Email
          </a>

          <a
            href={`tel:${contact.phone}`}
            className="details-action call-action"
          >
            ☎ Call
          </a>
        </div>

        <div className="details-bottom-actions">
          <button
            type="button"
            className="edit-button"
            onClick={() => onEdit(contact)}
          >
            ✎ Edit
          </button>

          <button
            type="button"
            className="delete-button"
            onClick={() => onDelete(contact)}
          >
            🗑 Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ContactDetails;