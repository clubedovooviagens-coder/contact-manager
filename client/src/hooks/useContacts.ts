import { useState, useEffect, useRef } from 'react';

export type ContactTemperature = 'frio' | 'morno' | 'quente';
export type ConsultorName = 'Ana Paula' | 'Júlia' | 'Joabh';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  ddd: string;
  contacted: boolean;
  temperature: ContactTemperature;
  consultor?: ConsultorName;
}

const STORAGE_KEY = 'contacts_data';
const CONSULTOR_KEY = 'selected_consultor';

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedConsultor, setSelectedConsultor] = useState<ConsultorName>('Ana Paula');

  // Usar refs para rastrear se já foi inicializado (DEVE estar aqui, antes de useEffect)
  const isInitialized = useRef(false);

  // Carregar contatos inicialmente (apenas uma vez)
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const loadContacts = async () => {
      try {
        // Tentar carregar do localStorage primeiro
        const savedContacts = localStorage.getItem(STORAGE_KEY);
        const savedConsultor = localStorage.getItem(CONSULTOR_KEY);

        if (savedContacts) {
          try {
            const parsedContacts = JSON.parse(savedContacts) as Contact[];
            // Normalizar contatos para garantir que todos tenham temperatura válida
            const normalizedContacts = parsedContacts.map(contact => ({
              ...contact,
              temperature: (['frio', 'morno', 'quente'].includes(contact.temperature)
                ? contact.temperature
                : 'frio') as ContactTemperature,
              consultor: contact.consultor || 'Ana Paula' as ConsultorName,
            }));
            setContacts(normalizedContacts);
            // Salvar os contatos normalizados de volta
            localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedContacts));
          } catch (err) {
            console.error('Erro ao parsear contatos:', err);
          }

          if (savedConsultor) {
            setSelectedConsultor(savedConsultor as ConsultorName);
          }
          setError(null);
          setLoading(false);
          return;
        }

        // Se não houver dados salvos, carregar do CSV
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
            consultor: 'Ana Paula' as ConsultorName,
          };
        });

        setContacts(parsed);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
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

  // Sincronização entre abas (apenas para mudanças externas)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // Apenas atualizar se a mudança veio de outra aba
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          setContacts(JSON.parse(event.newValue));
        } catch (err) {
          console.error('Erro ao carregar contatos do localStorage:', err);
        }
      }

      if (event.key === CONSULTOR_KEY && event.newValue) {
        setSelectedConsultor(event.newValue as ConsultorName);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Salvar contatos no localStorage sempre que mudarem
  useEffect(() => {
    if (contacts.length > 0 && isInitialized.current) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
    }
  }, [contacts]);

  // Salvar consultor no localStorage
  useEffect(() => {
    if (isInitialized.current) {
      localStorage.setItem(CONSULTOR_KEY, selectedConsultor);
    }
  }, [selectedConsultor]);

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
      consultor: selectedConsultor,
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

  // Classificar múltiplos contatos em lote
  const setBatchTemperature = (ids: Set<string>, temperature: ContactTemperature) => {
    setContacts(prev =>
      prev.map(contact =>
        ids.has(contact.id) ? { ...contact, temperature } : contact
      )
    );
  };

  const setConsultorForContact = (id: string, consultor: ConsultorName) => {
    setContacts(prev =>
      prev.map(contact =>
        contact.id === id ? { ...contact, consultor } : contact
      )
    );
  };

  const getWhatsAppMessage = (contact: Contact, consultor: ConsultorName) => {
    const emoji = '✨';
    // Pegar apenas o primeiro nome do cliente
    const firstName = contact.name.split(' ')[0];
    // Determinar o gênero do título baseado no consultor
    const titulo = ['Ana Paula', 'Júlia'].includes(consultor) ? 'Consultora' : 'Consultor';
    const baseMessage = `Olá, ${firstName}! Tudo bem? Sou ${consultor}, ${titulo} de Viagens do Clube do Voo Viagens, e vim te contar uma super novidade! ${emoji}`;
    return baseMessage;
  };

  const getWhatsAppLink = (contact: Contact, consultor: ConsultorName) => {
    const message = getWhatsAppMessage(contact, consultor);
    const phone = contact.phone.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phone}?text=${encodedMessage}`;
  };

  const resetAllContacts = async () => {
    // Limpar localStorage
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CONSULTOR_KEY);

    // Resetar estado
    setSelectedIds(new Set());
    setSelectedConsultor('Ana Paula');

    // Recarregar do arquivo CSV
    try {
      const response = await fetch('/contacts.csv');
      const text = await response.text();

      const lines = text.split('\n').filter(line => line.trim());
      const parsed: Contact[] = lines.map((line, index) => {
        const [name, phone] = line.split(';').map(s => s.trim());

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
          consultor: 'Ana Paula' as ConsultorName,
        };
      });

      setContacts(parsed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    } catch (err) {
      console.error('Erro ao resetar contatos:', err);
    }
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
    setBatchTemperature,
    getTemperatureCount,
    selectedConsultor,
    setSelectedConsultor,
    setConsultorForContact,
    getWhatsAppMessage,
    getWhatsAppLink,
    resetAllContacts,
  };
}
