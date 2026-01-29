import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Contact } from '@/hooks/useContacts';
import { Copy, Check, Edit2, Save, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ContactRowProps {
  contact: Contact;
  onToggleContacted: (id: string) => void;
  isSelected: boolean;
  onToggleSelected: (id: string) => void;
  onEditName: (id: string, newName: string) => void;
}

export default function ContactRow({
  contact,
  onToggleContacted,
  isSelected,
  onToggleSelected,
  onEditName,
}: ContactRowProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(contact.name);

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(contact.phone);
      setCopied(true);
      toast.success(`Telefone copiado: ${contact.phone}`);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Erro ao copiar telefone');
      console.error(err);
    }
  };

  const handleToggleContacted = () => {
    onToggleContacted(contact.id);
    if (!contact.contacted) {
      toast.success(`Contato marcado como realizado: ${contact.name}`);
    } else {
      toast.info(`Contato desmarcado: ${contact.name}`);
    }
  };

  const handleSaveName = () => {
    if (editedName.trim()) {
      onEditName(contact.id, editedName.trim());
      setIsEditing(false);
      toast.success('Nome atualizado');
    } else {
      toast.error('Nome não pode estar vazio');
    }
  };

  const handleCancelEdit = () => {
    setEditedName(contact.name);
    setIsEditing(false);
  };

  return (
    <div
      className={`flex items-center justify-between gap-4 p-4 border-b border-border transition-colors ${
        isSelected ? 'bg-blue-50' : contact.contacted ? 'bg-green-50' : 'hover:bg-secondary'
      }`}
    >
      {/* Checkbox */}
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onToggleSelected(contact.id)}
        className="h-5 w-5"
      />

      {/* Nome e DDD */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="flex-1 px-2 py-1 border border-blue-300 rounded text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSaveName}
                  className="p-1 h-auto"
                  title="Salvar"
                >
                  <Save className="h-4 w-4 text-green-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="p-1 h-auto"
                  title="Cancelar"
                >
                  <X className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <p
                  className={`font-medium text-foreground truncate cursor-pointer hover:text-blue-600 ${
                    contact.contacted ? 'line-through text-muted-foreground' : ''
                  }`}
                  onClick={() => setIsEditing(true)}
                  title="Clique para editar"
                >
                  {contact.name}
                </p>
                <Edit2 className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground whitespace-nowrap">
            DDD {contact.ddd}
          </span>
        </div>
      </div>

      {/* Telefone */}
      <div className="hidden sm:block">
        <p className="text-sm text-muted-foreground font-mono">{contact.phone}</p>
      </div>

      {/* Botões de Ação */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyPhone}
          title="Copiar telefone"
          className={copied ? 'bg-blue-50 border-blue-300' : ''}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4 text-blue-600" />
          )}
          <span className="hidden sm:inline ml-1 text-xs">Copiar</span>
        </Button>

        <Button
          variant={contact.contacted ? 'default' : 'outline'}
          size="sm"
          onClick={handleToggleContacted}
          title={contact.contacted ? 'Desmarcar contato' : 'Marcar como contato feito'}
          className={
            contact.contacted
              ? 'bg-green-600 hover:bg-green-700 border-green-600'
              : 'border-gray-300'
          }
        >
          <Check className="h-4 w-4" />
          <span className="hidden sm:inline ml-1 text-xs">
            {contact.contacted ? 'Feito' : 'Marcar'}
          </span>
        </Button>
      </div>
    </div>
  );
}
