import { useState, useEffect } from 'react';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  ddd: string;
  contacted: boolean;
}

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const response = await fetch('/contacts.csv');
        const text = await response.text();
        
        // Parse CSV
        const lines = text.split('\n').filter(line => line.trim());
        const parsed: Contact[] = lines.map((line, index) => {
          const [name, phone] = line.split(';').map(s => s.trim());
          
          // Extract DDD (first 2 digits of phone)
          const ddd = phone && phone.length >= 2 ? phone.substring(0, 2) : 'XX';
          
          return {
            id: `${index}-${name}`,
            name: name || 'Sem nome',
            phone: phone || '',
            ddd,
            contacted: false,
          };
        });
        
        setContacts(parsed);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar contatos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, []);

  const toggleContacted = (id: string) => {
    setContacts(prev =>
      prev.map(contact =>
        contact.id === id ? { ...contact, contacted: !contact.contacted } : contact
      )
    );
  };

  const getUniqueDDDs = () => {
    const ddds = new Set(contacts.map(c => c.ddd));
    return Array.from(ddds).sort();
  };

  const getContactedCount = () => {
    return contacts.filter(c => c.contacted).length;
  };

  const toggleSelected = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === contacts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(contacts.map(c => c.id)));
    }
  };

  const getSelectedPhones = () => {
    return contacts
      .filter(c => selectedIds.has(c.id))
      .map(c => c.phone)
      .join('\n');
  };

  const getSelectedContactsFormatted = () => {
    return contacts
      .filter(c => selectedIds.has(c.id))
      .map(c => `${c.name} - ${c.phone}`)
      .join('\n');
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const editName = (id: string, newName: string) => {
    setContacts(prev =>
      prev.map(contact =>
        contact.id === id ? { ...contact, name: newName } : contact
      )
    );
  };

  return {
    contacts,
    loading,
    error,
    toggleContacted,
    getUniqueDDDs,
    getContactedCount,
    selectedIds,
    toggleSelected,
    selectAll,
    getSelectedPhones,
    getSelectedContactsFormatted,
    clearSelection,
    editName,
  };
}
