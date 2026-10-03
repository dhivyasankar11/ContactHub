function DeleteModal({
  contact,
  onConfirm,
  onCancel,
}) {
  if (!contact) {
    return null;
  }

  return (
    <div
      className="delete-overlay"
      onClick={onCancel}
    >
      <div
        className="delete-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="delete-icon">
          🗑
        </div>

        <h2>Delete Contact?</h2>

        <p>
          Are you sure you want to delete{" "}
          <strong>{contact.name}</strong>?
        </p>

        <p className="delete-warning">
          This action cannot be undone.
        </p>

        <div className="delete-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            type="button"
            className="confirm-delete-button"
            onClick={onConfirm}
          >
            Delete Contact
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteModal;