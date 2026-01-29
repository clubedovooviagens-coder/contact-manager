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
 * - Layout: Tabela vertical com cards compactos, filtro fixo no topo
 * - Animações: Suaves, feedback imediato
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
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Phone className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Gerenciador de Contatos</h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total de contatos</p>
              <p className="text-2xl font-bold text-primary">{contacts.length}</p>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-secondary p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Contatos Realizados</p>
              <p className="text-xl font-bold text-accent">{contactedCount}</p>
            </div>
            <div className="bg-secondary p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Pendentes</p>
              <p className="text-xl font-bold text-primary">{contacts.length - contactedCount}</p>
            </div>
            <div className="bg-secondary p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Quentes</p>
              <p className="text-xl font-bold text-red-600">{getTemperatureCount('quente')}</p>
            </div>
            <div className="bg-secondary p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Progresso</p>
              <p className="text-xl font-bold text-foreground">
                {Math.round((contactedCount / contacts.length) * 100)}%
              </p>
            </div>
          </div>

          {/* Seleção em Lote */}
          {selectedIds.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <p className="text-sm font-medium text-foreground">
                  {selectedIds.size} contato(s) selecionado(s)
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                  {/* Seletor de modo de cópia */}
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      variant={copyMode === 'phones' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCopyMode('phones')}
                      className={copyMode === 'phones' ? 'bg-blue-600 hover:bg-blue-700' : 'border-blue-300'}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Telefones
                    </Button>
                    <Button
                      variant={copyMode === 'formatted' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCopyMode('formatted')}
                      className={copyMode === 'formatted' ? 'bg-blue-600 hover:bg-blue-700' : 'border-blue-300'}
                    >
                      <User className="h-4 w-4 mr-1" />
                      Nome + Tel
                    </Button>
                  </div>
                  
                  {/* Botões de ação */}
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleCopyBatch}
                      className={copiedBatch ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copiar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearSelection}
                      className="border-blue-300"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Limpar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botão de Adicionar Contato */}
          <div className="mb-6">
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-green-600 hover:bg-green-700"
            >
              + Adicionar Contato
            </Button>
          </div>

          {/* Formulário de Adicionar Contato */}
          {showAddForm && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Nome do contato"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="px-3 py-2 border border-green-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  placeholder="Telefone (ex: 5511999999999)"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="px-3 py-2 border border-green-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleAddContact}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Adicionar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewName('');
                      setNewPhone('');
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Filtro por DDD */}
          <div className="flex items-center gap-3 flex-wrap mb-6">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filtrar por DDD:</span>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedDDD === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDDD(null)}
                className="text-xs"
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
                    className="text-xs"
                  >
                    {ddd} ({count})
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Filtro por Temperatura */}
          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filtrar por Classificação:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => toggleTemperatureFilter('frio')}
                className={`px-3 py-1 rounded text-xs font-medium border transition-all ${
                  selectedTemperatures.has('frio')
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                }`}
              >
                Frio ({getTemperatureCount('frio')})
              </button>
              <button
                onClick={() => toggleTemperatureFilter('morno')}
                className={`px-3 py-1 rounded text-xs font-medium border transition-all ${
                  selectedTemperatures.has('morno')
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                    : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                }`}
              >
                Morno ({getTemperatureCount('morno')})
              </button>
              <button
                onClick={() => toggleTemperatureFilter('quente')}
                className={`px-3 py-1 rounded text-xs font-medium border transition-all ${
                  selectedTemperatures.has('quente')
                    ? 'bg-red-100 text-red-800 border-red-300'
                    : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                }`}
              >
                Quente ({getTemperatureCount('quente')})
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Lista de Contatos */}
      <main className="max-w-7xl mx-auto">
        {filteredContacts.length === 0 ? (
          <div className="text-center py-12">
            <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-foreground font-medium">Nenhum contato encontrado</p>
            <p className="text-sm text-muted-foreground">Tente alterar os filtros de DDD ou Classificação</p>
          </div>
        ) : (
          <div className="bg-white">
            {filteredContacts.map(contact => (
              <ContactRow
                key={contact.id}
                contact={contact}
                onToggleContacted={toggleContacted}
                isSelected={selectedIds.has(contact.id)}
                onToggleSelected={toggleSelected}
                onEditName={editName}
                onDelete={deleteContact}
                onSetTemperature={setTemperature}
                onSetConsultor={setConsultorForContact}
                getWhatsAppLink={getWhatsAppLink}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-secondary border-t border-border mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Gerenciador de Contatos • {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
