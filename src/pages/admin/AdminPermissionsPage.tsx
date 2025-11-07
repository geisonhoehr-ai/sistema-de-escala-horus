import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'

const roles = [
  {
    name: 'Administrador',
    permissions: [
      'Pode criar, editar e excluir escalas.',
      'Pode gerenciar todos os usuários e suas permissões.',
      'Pode gerenciar todos os militares e suas indisponibilidades.',
      'Pode gerar escalas automaticamente.',
      'Acesso total ao sistema.',
    ],
  },
  {
    name: 'Militar',
    permissions: [
      'Pode visualizar as escalas às quais está associado.',
      'Pode visualizar seu próprio perfil e histórico de serviços.',
      'Pode visualizar suas próprias indisponibilidades.',
      'Pode receber notificações do sistema.',
    ],
  },
]

export default function AdminPermissionsPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold">Gerenciamento de Permissões</h1>
        <p className="text-muted-foreground">
          Visualize as permissões associadas a cada papel no sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => (
          <Card key={role.name}>
            <CardHeader>
              <CardTitle>{role.name}</CardTitle>
              <CardDescription>
                Permissões para o papel de {role.name.toLowerCase()}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {role.permissions.map((permission, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{permission}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-sm text-muted-foreground text-center">
        Para esta versão do sistema, os papéis e suas permissões são fixos e não
        podem ser editados.
      </p>
    </div>
  )
}
