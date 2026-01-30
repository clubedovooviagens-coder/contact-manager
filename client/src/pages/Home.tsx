import { Button } from '@/components/ui/button';
import ContactRow from '@/components/ContactRow';
import { useContacts, ContactTemperature } from '@/hooks/useContacts';
import { Phone, Filter, AlertCircle, Copy, Trash2, User } from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';

/**
 * Design: Minimalismo com Foco em Produtividade
 * - Tipografia: Poppins Bold para títulos, Inter Regular para corpo
 * - Cores: Branco, Azul (#2563eb), Verde (#10b981), Cinza (#f3f4f6)
 * - Layout: Header minimalista, filtros na área principal
 * - Mobile: Layout ultra-compacto
 */
export default function Home() {
  const {
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
    getWhatsAppLink,
    resetAllContacts,
  } = useContacts();
  const [selectedDDD, setSelectedDDD] = useState<string | null>(null);
  const [selectedTemperature, setSelectedTemperature] = useState<ContactTemperature | null>(null); // null = todas
  const [copiedBatch, setCopiedBatch] = useState(false);
  const [copyMode, setCopyMode] = useState<'phones' | 'formatted'>('phones');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const uniqueDDDs = useMemo(() => getUniqueDDDs(), [contacts]);
  const contactedCount = useMemo(() => getContactedCount(), [contacts]);

  // Contadores por temperatura
  const temperatureCounts = useMemo(() => ({
    frio: contacts.filter(c => c.temperature === 'frio').length,
    morno: contacts.filter(c => c.temperature === 'morno').length,
    quente: contacts.filter(c => c.temperature === 'quente').length,
  }), [contacts]);

  const filteredContacts = useMemo(() => {
    let filtered = contacts;

    if (selectedDDD) {
      filtered = filtered.filter(c => c.ddd === selectedDDD);
    }

    // Filtrar por temperatura se uma estiver selecionada
    if (selectedTemperature) {
      filtered = filtered.filter(c => c.temperature === selectedTemperature);
    }

    return filtered;
  }, [contacts, selectedDDD, selectedTemperature]);

  // Handler para seleção de filtro de temperatura (exclusivo)
  const selectTemperatureFilter = (temp: ContactTemperature | null) => {
    setSelectedTemperature(temp);
  };

  // Handler para classificação que também atualiza o filtro
  const handleSetTemperature = (contactId: string, temp: ContactTemperature) => {
    const contact = contacts.find(c => c.id === contactId);
    const oldTemp = contact?.temperature;

    // Aplicar a nova temperatura
    setTemperature(contactId, temp);

    // Mostrar feedback
    if (oldTemp !== temp) {
      const tempLabels = { frio: 'Frio ❄️', morno: 'Morno 🌤️', quente: 'Quente 🔥' };
      toast.success(`${contact?.name} → ${tempLabels[temp]}`);
    }
  };

  const handleCopyBatch = async () => {
    if (selectedIds.size === 0) {
      toast.error('Selecione pelo menos um contato');
      return;
    }

    try {
      const textToCopy = copyMode === 'formatted'
        ? getSelectedContactsFormatted()
        : getSelectedPhones();

      await navigator.clipboard.writeText(textToCopy);
      setCopiedBatch(true);

      const modeLabel = copyMode === 'formatted' ? 'contato(s)' : 'telefone(s)';
      toast.success(`${selectedIds.size} ${modeLabel} copiado(s)`);
      setTimeout(() => setCopiedBatch(false), 2000);
    } catch (err) {
      toast.error('Erro ao copiar');
      console.error(err);
    }
  };

  const handleAddContact = () => {
    if (!newName.trim() || !newPhone.trim()) {
      toast.error('Preencha nome e telefone');
      return;
    }
    addContact(newName.trim(), newPhone.trim());
    toast.success(`Contato adicionado: ${newName}`);
    setNewName('');
    setNewPhone('');
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Phone className="h-8 w-8 text-primary mx-auto" />
          </div>
          <p className="text-foreground font-medium">Carregando contatos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-foreground font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Ultra Minimalista */}
      <header className="bg-white border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-2 md:py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Phone className="h-5 md:h-6 w-5 md:w-6 text-primary flex-shrink-0" />
              <h1 className="text-lg md:text-2xl font-bold text-foreground truncate">Gerenciador</h1>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <p className="text-xs md:text-sm text-muted-foreground">Total</p>
              <p className="text-base md:text-lg font-bold text-primary">{contacts.length}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-3 md:px-4 py-3 md:py-4">
        {/* Seleção em Lote - Fixa no topo ao rolar */}
        {selectedIds.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 md:p-3 mb-3 sticky top-[52px] md:top-[56px] z-10 shadow-md">
            <div className="flex flex-col gap-2">
              <p className="text-xs md:text-sm font-medium text-foreground">
                {selectedIds.size} selecionado(s)
              </p>
              <div className="flex flex-col gap-1.5">
                <div className="flex gap-1.5">
                  <Button
                    variant={copyMode === 'phones' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCopyMode('phones')}
                    className={`flex-1 text-xs ${copyMode === 'phones' ? 'bg-blue-600 hover:bg-blue-700' : 'border-blue-300'}`}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Tel
                  </Button>
                  <Button
                    variant={copyMode === 'formatted' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCopyMode('formatted')}
                    className={`flex-1 text-xs ${copyMode === 'formatted' ? 'bg-blue-600 hover:bg-blue-700' : 'border-blue-300'}`}
                  >
                    <User className="h-3 w-3 mr-1" />
                    Nome
                  </Button>
                </div>

                <div className="flex gap-1.5">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleCopyBatch}
                    className={`flex-1 text-xs ${copiedBatch ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    Copiar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSelection}
                    className="flex-1 text-xs"
                  >
                    Limpar
                  </Button>
                </div>

                {/* Classificação em Lote */}
                <div className="flex gap-1.5 pt-1 border-t border-blue-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setBatchTemperature(selectedIds, 'frio');
                      toast.success(`${selectedIds.size} contato(s) classificado(s) como Frio ❄️`);
                    }}
                    className="flex-1 text-xs bg-blue-500 hover:bg-blue-600 text-white border-blue-600"
                  >
                    ❄️ Frio
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setBatchTemperature(selectedIds, 'morno');
                      toast.success(`${selectedIds.size} contato(s) classificado(s) como Morno 🌤️`);
                    }}
                    className="flex-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-600"
                  >
                    🌤️ Morno
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setBatchTemperature(selectedIds, 'quente');
                      toast.success(`${selectedIds.size} contato(s) classificado(s) como Quente 🔥`);
                    }}
                    className="flex-1 text-xs bg-red-500 hover:bg-red-600 text-white border-red-600"
                  >
                    🔥 Quente
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="mb-3 flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-green-600 hover:bg-green-700 text-xs md:text-sm"
          >
            + Adicionar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (window.confirm('Tem certeza que deseja resetar todos os contatos? Esta ação não pode ser desfeita.')) {
                resetAllContacts();
                toast.success('Contatos resetados com sucesso!');
              }
            }}
            className="text-xs md:text-sm border-red-300 text-red-600 hover:bg-red-50"
          >
            🔄 Resetar
          </Button>
        </div>

        {/* Formulário de Adicionar */}
        {showAddForm && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-2 md:p-3 mb-3">
            <div className="flex flex-col gap-1.5">
              <input
                type="text"
                placeholder="Nome"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="px-2 py-1.5 border border-green-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="tel"
                placeholder="Telefone"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="px-2 py-1.5 border border-green-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <div className="flex gap-1.5">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleAddContact}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-xs"
                >
                  Adicionar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 text-xs"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="space-y-2 mb-4">
          {/* Filtro por DDD */}
          <div>
            <p className="text-xs font-medium text-foreground mb-1.5 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" /> DDD
            </p>
            <div className="flex flex-wrap gap-1">
              <Button
                variant={selectedDDD === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDDD(null)}
                className={`text-xs h-7 px-2 ${selectedDDD === null ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
              >
                Todos
              </Button>
              {uniqueDDDs.map(ddd => {
                const count = contacts.filter(c => c.ddd === ddd).length;
                return (
                  <Button
                    key={ddd}
                    variant={selectedDDD === ddd ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDDD(ddd)}
                    className={`text-xs h-7 px-2 ${selectedDDD === ddd ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  >
                    {ddd}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Filtro por Classificação */}
          <div>
            <p className="text-xs font-medium text-foreground mb-1.5 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" /> Classificação
            </p>
            <div className="flex gap-1">
              <Button
                variant={selectedTemperature === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => selectTemperatureFilter(null)}
                className={`text-xs h-7 px-2 ${selectedTemperature === null ? 'bg-gray-600 hover:bg-gray-700' : ''}`}
              >
                Todos ({contacts.length})
              </Button>
              <Button
                variant={selectedTemperature === 'frio' ? 'default' : 'outline'}
                size="sm"
                onClick={() => selectTemperatureFilter('frio')}
                className={`flex-1 text-xs h-7 ${selectedTemperature === 'frio' ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''}`}
              >
                ❄️ Frio ({temperatureCounts.frio})
              </Button>
              <Button
                variant={selectedTemperature === 'morno' ? 'default' : 'outline'}
                size="sm"
                onClick={() => selectTemperatureFilter('morno')}
                className={`flex-1 text-xs h-7 ${selectedTemperature === 'morno' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : ''}`}
              >
                🌤️ Morno ({temperatureCounts.morno})
              </Button>
              <Button
                variant={selectedTemperature === 'quente' ? 'default' : 'outline'}
                size="sm"
                onClick={() => selectTemperatureFilter('quente')}
                className={`flex-1 text-xs h-7 ${selectedTemperature === 'quente' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
              >
                🔥 Quente ({temperatureCounts.quente})
              </Button>
            </div>
          </div>

          {/* Botão de Resetar Filtros */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedDDD(null);
                setSelectedTemperature(null);
              }}
              className="text-xs border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              ↺ Resetar Filtros
            </Button>
          </div>
        </div>

        {/* Lista de Contatos */}
        {filteredContacts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">Nenhum contato encontrado</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredContacts.map(contact => (
              <ContactRow
                key={contact.id}
                contact={contact}
                onToggleContacted={toggleContacted}
                onToggleSelected={toggleSelected}
                isSelected={selectedIds.has(contact.id)}
                onEditName={editName}
                onDelete={deleteContact}
                onSetTemperature={(id, temp) => handleSetTemperature(id, temp)}
                onSetConsultor={(id, consultor) => setConsultorForContact(id, consultor)}
                getWhatsAppLink={getWhatsAppLink}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
