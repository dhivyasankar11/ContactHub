const CATEGORY_OPTIONS = [
  "College",
  "Work",
  "Friends",
  "Family",
  "Professional",
  "Personal",
];

function ContactForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isEditing = false,
}) {
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  return (
    <form className="contact-form" onSubmit={onSubmit}>
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name || ""}
          onChange={handleChange}
          placeholder="Enter contact name"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="role">Role</label>
        <input
          id="role"
          name="role"
          type="text"
          value={formData.role || ""}
          onChange={handleChange}
          placeholder="e.g. Web Developer"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email || ""}
          onChange={handleChange}
          placeholder="example@email.com"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone || ""}
          onChange={handleChange}
          placeholder="+91 98765 43210"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="category">Category</label>

        <select
          id="category"
          name="category"
          value={formData.category || "Personal"}
          onChange={handleChange}
        >
          {CATEGORY_OPTIONS.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="cancel-button"
          onClick={onCancel}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="submit-button"
        >
          {isEditing ? "Save Changes" : "Add Contact"}
        </button>
      </div>
    </form>
  );
}

export default ContactForm;