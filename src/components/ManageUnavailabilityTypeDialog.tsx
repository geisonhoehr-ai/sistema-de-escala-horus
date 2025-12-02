import { useEffect } from 'react'
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
import { UnavailabilityTypeDefinition } from '@/types'
import useDataStore from '@/stores/data.store'
import { toast } from './ui/use-toast'

const typeSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
})

type TypeFormValues = z.infer<typeof typeSchema>

interface ManageUnavailabilityTypeDialogProps {
  typeDef?: UnavailabilityTypeDefinition
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const ManageUnavailabilityTypeDialog = ({
  typeDef,
  isOpen,
  onOpenChange,
}: ManageUnavailabilityTypeDialogProps) => {
  const { addUnavailabilityType, updateUnavailabilityType } = useDataStore()
  const isEditing = !!typeDef

  const form = useForm<TypeFormValues>({
    resolver: zodResolver(typeSchema),
    defaultValues: {
      name: '',
    },
  })

  useEffect(() => {
    if (typeDef) {
      form.reset({
        name: typeDef.name,
      })
    } else {
      form.reset({
        name: '',
      })
    }
  }, [typeDef, form, isOpen])

  const onSubmit = (data: TypeFormValues) => {
    if (isEditing && typeDef) {
      updateUnavailabilityType({ id: typeDef.id, ...data })
      toast({
        title: 'Tipo Atualizado',
        description: `O tipo "${data.name}" foi atualizado.`,
      })
    } else {
      addUnavailabilityType(data)
      toast({
        title: 'Tipo Criado',
        description: `O tipo "${data.name}" foi criado.`,
      })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar' : 'Criar'} Tipo de Indisponibilidade
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Altere o nome do tipo de indisponibilidade.'
              : 'Defina um novo tipo de indisponibilidade.'}
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
                    <Input placeholder="Ex: Licença Paternidade" {...field} />
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
              <Button type="submit">
                {isEditing ? 'Salvar Alterações' : 'Criar Tipo'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
