import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Military } from '@/types'
import useDataStore from '@/stores/data.store'
import { toast } from './ui/use-toast'

const militarySchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  rank: z.string().min(2, 'O posto/graduação é obrigatório.'),
  email: z.string().email('Email inválido.'),
  phone: z.string().optional(),
  avatarUrl: z.string().url('URL da imagem inválida.').optional(),
})

type MilitaryFormValues = z.infer<typeof militarySchema>

interface EditMilitaryDialogProps {
  militaryPerson: Military
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const EditMilitaryDialog = ({
  militaryPerson,
  isOpen,
  onOpenChange,
}: EditMilitaryDialogProps) => {
  const updateMilitary = useDataStore((state) => state.updateMilitary)

  const form = useForm<MilitaryFormValues>({
    resolver: zodResolver(militarySchema),
    defaultValues: {
      name: militaryPerson.name,
      rank: militaryPerson.rank,
      email: militaryPerson.email,
      phone: militaryPerson.phone,
      avatarUrl: militaryPerson.avatarUrl,
    },
  })

  const onSubmit = (data: MilitaryFormValues) => {
    updateMilitary({ id: militaryPerson.id, ...data })
    toast({
      title: 'Militar Atualizado',
      description: `Os dados de "${data.name}" foram atualizados.`,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Militar</DialogTitle>
          <DialogDescription>
            Altere as informações do militar.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rank"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Posto/Graduação</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Foto</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar Alterações</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
