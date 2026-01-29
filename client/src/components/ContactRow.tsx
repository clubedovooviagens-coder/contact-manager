import { Button } from '@/components/ui/button';
import { Contact } from '@/hooks/useContacts';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ContactRowProps {
  contact: Contact;
  onToggleContacted: (id: string) => void;
}

export default function ContactRow({ contact, onToggleContacted }: ContactRowProps) {
  const [copied, setCopied] = useState(false);

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

  return (
    <div
      className={`flex items-center justify-between gap-4 p-4 border-b border-border transition-colors ${
        contact.contacted ? 'bg-green-50' : 'hover:bg-secondary'
      }`}
    >
      {/* Nome e DDD */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p
              className={`font-medium text-foreground truncate ${
                contact.contacted ? 'line-through text-muted-foreground' : ''
              }`}
            >
              {contact.name}
            </p>
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
