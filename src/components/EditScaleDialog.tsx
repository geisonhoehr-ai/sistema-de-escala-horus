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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Scale } from '@/types'
import useDataStore from '@/stores/data.store'
import { toast } from './ui/use-toast'

const scaleSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  description: z.string().optional(),
})

type ScaleFormValues = z.infer<typeof scaleSchema>

interface EditScaleDialogProps {
  scale: Scale
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const EditScaleDialog = ({
  scale,
  isOpen,
  onOpenChange,
}: EditScaleDialogProps) => {
  const updateScale = useDataStore((state) => state.updateScale)

  const form = useForm<ScaleFormValues>({
    resolver: zodResolver(scaleSchema),
    defaultValues: {
      name: scale.name,
      description: scale.description,
    },
  })

  const onSubmit = (data: ScaleFormValues) => {
    updateScale({ id: scale.id, ...data })
    toast({
      title: 'Escala Atualizada',
      description: `A escala "${data.name}" foi atualizada com sucesso.`,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Escala</DialogTitle>
          <DialogDescription>
            Altere as informações da escala. Clique em salvar para aplicar as
            mudanças.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Escala</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
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
