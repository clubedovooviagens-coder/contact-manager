import { Button } from '@/components/ui/button';
import ContactRow from '@/components/ContactRow';
import { useContacts } from '@/hooks/useContacts';
import { Phone, Filter, AlertCircle, Copy, Trash2 } from 'lucide-react';
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
    clearSelection,
  } = useContacts();
  const [selectedDDD, setSelectedDDD] = useState<string | null>(null);
  const [copiedBatch, setCopiedBatch] = useState(false);

  const uniqueDDDs = useMemo(() => getUniqueDDDs(), [contacts]);
  const contactedCount = useMemo(() => getContactedCount(), [contacts]);

  const filteredContacts = useMemo(() => {
    if (!selectedDDD) return contacts;
    return contacts.filter(c => c.ddd === selectedDDD);
  }, [contacts, selectedDDD]);

  const handleCopyBatch = async () => {
    if (selectedIds.size === 0) {
      toast.error('Selecione pelo menos um contato');
      return;
    }

    try {
      const phones = getSelectedPhones();
      await navigator.clipboard.writeText(phones);
      setCopiedBatch(true);
      toast.success(`${selectedIds.size} telefone(s) copiado(s) para a área de transferência`);
      setTimeout(() => setCopiedBatch(false), 2000);
    } catch (err) {
      toast.error('Erro ao copiar telefones');
      console.error(err);
    }
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-secondary p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Contatos Realizados</p>
              <p className="text-xl font-bold text-accent">{contactedCount}</p>
            </div>
            <div className="bg-secondary p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Pendentes</p>
              <p className="text-xl font-bold text-primary">{contacts.length - contactedCount}</p>
            </div>
            <div className="bg-secondary p-3 rounded-lg col-span-2 sm:col-span-1">
              <p className="text-xs text-muted-foreground mb-1">Progresso</p>
              <p className="text-xl font-bold text-foreground">
                {Math.round((contactedCount / contacts.length) * 100)}%
              </p>
            </div>
          </div>

          {/* Seleção em Lote */}
          {selectedIds.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-foreground">
                  {selectedIds.size} contato(s) selecionado(s)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleCopyBatch}
                  className={copiedBatch ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copiar em Lote
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
          )}

          {/* Filtro por DDD */}
          <div className="flex items-center gap-3 flex-wrap">
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
        </div>
      </header>

      {/* Lista de Contatos */}
      <main className="max-w-7xl mx-auto">
        {filteredContacts.length === 0 ? (
          <div className="text-center py-12">
            <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-foreground font-medium">Nenhum contato encontrado</p>
            <p className="text-sm text-muted-foreground">Tente alterar o filtro de DDD</p>
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
