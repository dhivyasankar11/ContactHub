import ContactCard from "./ContactCard";

function ContactList({
  contacts,
  toggleFavorite,
  openEditModal,
  openDetails,
  askDeleteContact,
}) {
  return (
    <div className="contacts-grid">
      {contacts.map((contact) => (
        <ContactCard
          key={contact.id}
          contact={contact}
          toggleFavorite={toggleFavorite}
          openEditModal={openEditModal}
          openDetails={openDetails}
          askDeleteContact={askDeleteContact}
        />
      ))}
    </div>
  );
}

export default ContactList;