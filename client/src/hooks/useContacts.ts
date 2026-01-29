import { useState, useEffect } from 'react';

export type ContactTemperature = 'frio' | 'morno' | 'quente';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  ddd: string;
  contacted: boolean;
  temperature: ContactTemperature;
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
          
          // Extract DDD com logica aprimorada:
          // - 11 digitos: DDD = primeiros 2 digitos
          // - 13 digitos comecando com 55: DDD = digitos 3-4 (55 eh DDI)
          // - Outros: primeiros 2 digitos ou XX
          let ddd = 'XX';
          if (phone) {
            const digits = phone.replace(/\D/g, '');
            if (digits.length === 11) {
              ddd = digits.substring(0, 2);
            } else if (digits.length === 13 && digits.startsWith('55')) {
              ddd = digits.substring(2, 4);
            } else if (digits.length >= 2) {
              ddd = digits.substring(0, 2);
            }
          }
          
          return {
            id: `${index}-${name}`,
            name: name || 'Sem nome',
            phone: phone || '',
            ddd,
            contacted: false,
            temperature: 'frio' as ContactTemperature,
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

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(contact => contact.id !== id));
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const addContact = (name: string, phone: string) => {
    // Extract DDD using the same logic
    let ddd = 'XX';
    if (phone) {
      const digits = phone.replace(/\D/g, '');
      if (digits.length === 11) {
        ddd = digits.substring(0, 2);
      } else if (digits.length === 13 && digits.startsWith('55')) {
        ddd = digits.substring(2, 4);
      } else if (digits.length >= 2) {
        ddd = digits.substring(0, 2);
      }
    }

    const newContact: Contact = {
      id: `${Date.now()}-${name}`,
      name: name || 'Sem nome',
      phone: phone || '',
      ddd,
      contacted: false,
      temperature: 'frio' as ContactTemperature,
    };

    setContacts(prev => [newContact, ...prev]);
  };

  const setTemperature = (id: string, temperature: ContactTemperature) => {
    setContacts(prev =>
      prev.map(contact =>
        contact.id === id ? { ...contact, temperature } : contact
      )
    );
  };

  const getTemperatureCount = (temperature: ContactTemperature) => {
    return contacts.filter(c => c.temperature === temperature).length;
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
    deleteContact,
    addContact,
    setTemperature,
    getTemperatureCount,
  };
}
