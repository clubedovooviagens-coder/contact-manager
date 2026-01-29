import { Button } from '@/components/ui/button';
import ContactRow from '@/components/ContactRow';
import { useContacts, ContactTemperature } from '@/hooks/useContacts';
import { Phone, Filter, AlertCircle, Copy, Trash2, User, ChevronDown } from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';

/**
 * Design: Minimalismo com Foco em Produtividade
 * - Tipografia: Poppins Bold para títulos, Inter Regular para corpo
 * - Cores: Branco, Azul (#2563eb), Verde (#10b981), Cinza (#f3f4f6)
 * - Layout: Tabela vertical com cards compactos, filtro fixo no topo
 * - Animações: Suaves, feedback imediato
 * - Mobile: Layout responsivo com compactação de elementos
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
    getTemperatureCount,
    selectedConsultor,
    setSelectedConsultor,
    setConsultorForContact,
    getWhatsAppLink,
  } = useContacts();
  const [selectedDDD, setSelectedDDD] = useState<string | null>(null);
  const [selectedTemperatures, setSelectedTemperatures] = useState<Set<ContactTemperature>>(
    new Set(['frio', 'morno', 'quente'] as ContactTemperature[])
  );
  const [copiedBatch, setCopiedBatch] = useState(false);
  const [copyMode, setCopyMode] = useState<'phones' | 'formatted'>('phones');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [showStats, setShowStats] = useState(true);

  const uniqueDDDs = useMemo(() => getUniqueDDDs(), [contacts]);
  const contactedCount = useMemo(() => getContactedCount(), [contacts]);

  const filteredContacts = useMemo(() => {
    let filtered = contacts;
    
    // Filtro por DDD
    if (selectedDDD) {
      filtered = filtered.filter(c => c.ddd === selectedDDD);
    }
    
    // Filtro por Temperatura
    filtered = filtered.filter(c => selectedTemperatures.has(c.temperature));
    
    return filtered;
  }, [contacts, selectedDDD, selectedTemperatures]);

  const toggleTemperatureFilter = (temp: ContactTemperature) => {
    const newSet = new Set(selectedTemperatures);
    if (newSet.has(temp)) {
      newSet.delete(temp);
    } else {
      newSet.add(temp);
    }
    setSelectedTemperatures(newSet);
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
      toast.success(`${selectedIds.size} ${modeLabel} copiado(s) para a área de transferência`);
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
      {/* Header - Compactado */}
      <header className="bg-white border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-3 md:py-4">
          {/* Título e Total */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Phone className="h-6 md:h-8 w-6 md:w-8 text-primary flex-shrink-0" />
              <h1 className="text-xl md:text-3xl font-bold text-foreground truncate">Gerenciador de Contatos</h1>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs md:text-sm text-muted-foreground">Total</p>
              <p className="text-lg md:text-2xl font-bold text-primary">{contacts.length}</p>
            </div>
          </div>

          {/* Estatísticas - Colapsível em Mobile */}
          <div className="mb-3">
            <button
              onClick={() => setShowStats(!showStats)}
              className="md:hidden flex items-center gap-2 text-sm font-medium text-foreground mb-2"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${showStats ? 'rotate-180' : ''}`} />
              Estatísticas
            </button>
            
            {(showStats || window.innerWidth >= 768) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                <div className="bg-secondary p-2 md:p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-0.5">Realizados</p>
                  <p className="text-lg md:text-xl font-bold text-accent">{contactedCount}</p>
                </div>
                <div className="bg-secondary p-2 md:p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-0.5">Pendentes</p>
                  <p className="text-lg md:text-xl font-bold text-primary">{contacts.length - contactedCount}</p>
                </div>
                <div className="bg-secondary p-2 md:p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-0.5">Quentes</p>
                  <p className="text-lg md:text-xl font-bold text-red-600">{getTemperatureCount('quente')}</p>
                </div>
                <div className="bg-secondary p-2 md:p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-0.5">Progresso</p>
                  <p className="text-lg md:text-xl font-bold text-foreground">
                    {Math.round((contactedCount / contacts.length) * 100)}%
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Seleção em Lote */}
          {selectedIds.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 mb-3">
              <div className="flex flex-col gap-3">
                <p className="text-xs md:text-sm font-medium text-foreground">
                  {selectedIds.size} contato(s) selecionado(s)
                </p>
                <div className="flex flex-col gap-2">
                  {/* Seletor de modo de cópia */}
                  <div className="flex gap-2">
                    <Button
                      variant={copyMode === 'phones' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCopyMode('phones')}
                      className={`text-xs md:text-sm ${copyMode === 'phones' ? 'bg-blue-600 hover:bg-blue-700' : 'border-blue-300'}`}
                    >
                      <Copy className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      <span className="hidden sm:inline">Telefones</span>
                      <span className="sm:hidden">Tel</span>
                    </Button>
                    <Button
                      variant={copyMode === 'formatted' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCopyMode('formatted')}
                      className={`text-xs md:text-sm ${copyMode === 'formatted' ? 'bg-blue-600 hover:bg-blue-700' : 'border-blue-300'}`}
                    >
                      <User className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      <span className="hidden sm:inline">Nome + Tel</span>
                      <span className="sm:hidden">Nome</span>
                    </Button>
                  </div>
                  
                  {/* Botões de ação */}
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleCopyBatch}
                      className={`flex-1 text-xs md:text-sm ${copiedBatch ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                      <Copy className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      Copiar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearSelection}
                      className="flex-1 text-xs md:text-sm border-blue-300"
                    >
                      <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      Limpar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botão de Adicionar Contato */}
          <div className="mb-3">
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-green-600 hover:bg-green-700 text-xs md:text-sm"
            >
              + Adicionar Contato
            </Button>
          </div>

          {/* Formulário de Adicionar Contato */}
          {showAddForm && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 md:p-4 mb-3">
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Nome do contato"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="px-3 py-2 border border-green-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="tel"
                  placeholder="Telefone"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="px-3 py-2 border border-green-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleAddContact}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-xs md:text-sm"
                  >
                    Adicionar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 text-xs md:text-sm"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Filtros */}
          <div className="space-y-2 md:space-y-3">
            {/* Filtro por DDD */}
            <div>
              <p className="text-xs md:text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Filter className="h-4 w-4" /> Filtrar por DDD:
              </p>
              <div className="flex flex-wrap gap-1 md:gap-2">
                <Button
                  variant={selectedDDD === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDDD(null)}
                  className={`text-xs md:text-sm ${selectedDDD === null ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                >
                  Todos ({contacts.length})
                </Button>
                {uniqueDDDs.map(ddd => {
                  const count = contacts.filter(c => c.ddd === ddd).length;
                  return (
                    <Button
                      key={ddd}
                      variant={selectedDDD === ddd ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedDDD(ddd)}
                      className={`text-xs md:text-sm ${selectedDDD === ddd ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    >
                      {ddd} ({count})
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Filtro por Classificação */}
            <div>
              <p className="text-xs md:text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Filter className="h-4 w-4" /> Filtrar por Classificação:
              </p>
              <div className="flex flex-wrap gap-1 md:gap-2">
                <Button
                  variant={selectedTemperatures.has('frio') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleTemperatureFilter('frio')}
                  className={`text-xs md:text-sm ${selectedTemperatures.has('frio') ? 'bg-blue-400 hover:bg-blue-500' : ''}`}
                >
                  Frio ({getTemperatureCount('frio')})
                </Button>
                <Button
                  variant={selectedTemperatures.has('morno') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleTemperatureFilter('morno')}
                  className={`text-xs md:text-sm ${selectedTemperatures.has('morno') ? 'bg-yellow-400 hover:bg-yellow-500' : ''}`}
                >
                  Morno ({getTemperatureCount('morno')})
                </Button>
                <Button
                  variant={selectedTemperatures.has('quente') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleTemperatureFilter('quente')}
                  className={`text-xs md:text-sm ${selectedTemperatures.has('quente') ? 'bg-red-500 hover:bg-red-600' : ''}`}
                >
                  Quente ({getTemperatureCount('quente')})
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Lista de Contatos */}
      <main className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-6">
        {filteredContacts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum contato encontrado com os filtros selecionados</p>
          </div>
        ) : (
          <div className="space-y-2 md:space-y-3">
            {filteredContacts.map(contact => (
              <ContactRow
                key={contact.id}
                contact={contact}
                onToggleContacted={() => toggleContacted(contact.id)}
                onToggleSelected={() => toggleSelected(contact.id)}
                isSelected={selectedIds.has(contact.id)}
                onEditName={(newName) => editName(contact.id, newName)}
                onDelete={() => deleteContact(contact.id)}
                onSetTemperature={(temp) => setTemperature(contact.id, temp as ContactTemperature)}
                onSetConsultor={(consultor) => setConsultorForContact(contact.id, consultor as any)}
                getWhatsAppLink={() => getWhatsAppLink(contact, (contact.consultor as any) || 'Ana Paula')}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
