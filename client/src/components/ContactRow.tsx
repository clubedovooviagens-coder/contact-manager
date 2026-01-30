import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Contact, ContactTemperature, ConsultorName } from '@/hooks/useContacts';
import { Copy, Check, Edit2, Save, X, Trash2, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ContactRowProps {
  contact: Contact;
  onToggleContacted: (id: string) => void;
  isSelected: boolean;
  onToggleSelected: (id: string) => void;
  onEditName: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
  onSetTemperature: (id: string, temperature: ContactTemperature) => void;
  onSetConsultor: (id: string, consultor: ConsultorName) => void;
  getWhatsAppLink: (contact: Contact, consultor: ConsultorName) => string;
}

export default function ContactRow({
  contact,
  onToggleContacted,
  isSelected,
  onToggleSelected,
  onEditName,
  onDelete,
  onSetTemperature,
  onSetConsultor,
  getWhatsAppLink,
}: ContactRowProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(contact.name);

  const getTemperatureColor = (temp: ContactTemperature) => {
    switch (temp) {
      case 'frio':
        return 'bg-blue-500 text-white border-blue-600 shadow-sm';
      case 'morno':
        return 'bg-yellow-500 text-white border-yellow-600 shadow-sm';
      case 'quente':
        return 'bg-red-500 text-white border-red-600 shadow-sm';
    }
  };

  const getTemperatureLabel = (temp: ContactTemperature) => {
    switch (temp) {
      case 'frio':
        return 'Frio';
      case 'morno':
        return 'Morno';
      case 'quente':
        return 'Quente';
    }
  };

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

  const handleDelete = () => {
    if (window.confirm(`Tem certeza que deseja deletar ${contact.name}?`)) {
      onDelete(contact.id);
      toast.success(`Contato deletado: ${contact.name}`);
    }
  };

  const handleWhatsApp = () => {
    const consultor = contact.consultor || 'Ana Paula';
    const link = getWhatsAppLink(contact, consultor);
    window.open(link, '_blank');
  };

  return (
    <div
      className={`flex items-center justify-between gap-3 p-4 border-b border-border transition-colors ${isSelected ? 'bg-blue-50' : contact.contacted ? 'bg-green-50' : 'hover:bg-secondary'
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
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
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
                  className={`font-medium text-foreground truncate cursor-pointer hover:text-blue-600 ${contact.contacted ? 'line-through text-muted-foreground' : ''
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
        <p className="text-sm text-muted-foreground font-mono whitespace-nowrap">{contact.phone}</p>
      </div>

      {/* Seletor de Consultor */}
      <select
        value={contact.consultor || 'Ana Paula'}
        onChange={(e) => onSetConsultor(contact.id, e.target.value as ConsultorName)}
        className="px-2 py-1 rounded text-xs border border-gray-300 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
        title="Selecionar consultor"
      >
        <option value="Ana Paula">Ana Paula</option>
        <option value="Júlia">Júlia</option>
        <option value="Joabh">Joabh</option>
      </select>

      {/* Classificação de Temperatura */}
      <div className="flex items-center gap-1">
        {(['frio', 'morno', 'quente'] as ContactTemperature[]).map((temp) => (
          <button
            key={temp}
            onClick={() => onSetTemperature(contact.id, temp)}
            className={`px-2 py-1 rounded text-xs font-medium border transition-all ${contact.temperature === temp
                ? getTemperatureColor(temp)
                : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
              }`}
            title={`Classificar como ${getTemperatureLabel(temp)}`}
          >
            {getTemperatureLabel(temp)}
          </button>
        ))}
      </div>

      {/* Botões de Ação */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handleWhatsApp}
          title="Enviar mensagem no WhatsApp"
          className="p-1 h-auto"
        >
          <MessageCircle className="h-4 w-4 text-green-600" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyPhone}
          title="Copiar telefone"
          className={`p-1 h-auto ${copied ? 'bg-blue-50 border-blue-300' : ''}`}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4 text-blue-600" />
          )}
        </Button>

        <Button
          variant={contact.contacted ? 'default' : 'outline'}
          size="sm"
          onClick={handleToggleContacted}
          title={contact.contacted ? 'Desmarcar contato' : 'Marcar como contato feito'}
          className={`p-1 h-auto ${contact.contacted
              ? 'bg-green-600 hover:bg-green-700 border-green-600'
              : 'border-gray-300'
            }`}
        >
          <Check className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          title="Deletar contato"
          className="p-1 h-auto"
        >
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    </div>
  );
}
