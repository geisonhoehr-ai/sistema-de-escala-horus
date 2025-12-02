import { useParams, Link } from 'react-router-dom'
import useDataStore from '@/stores/data.store'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ChevronLeft, Mail, Phone, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { EditMilitaryDialog } from '@/components/EditMilitaryDialog'
import { ManageUnavailabilityDialog } from '@/components/ManageUnavailabilityDialog'
import { EditUnavailabilityDialog } from '@/components/EditUnavailabilityDialog'

export default function MilitaryProfilePage() {
  const { militaryId } = useParams()
  const {
    military,
    unavailabilities,
    unavailabilityTypes,
    deleteUnavailability,
  } = useDataStore()

  const person = military.find((m) => m.id === militaryId)
  const personUnavailabilities = unavailabilities.filter(
    (u) => u.militaryId === militaryId,
  )

  if (!person) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <h2 className="text-2xl font-bold">Military Not Found</h2>
        <p className="text-muted-foreground">
          The military personnel you are looking for does not exist.
        </p>
        <Button asChild>
          <Link to="/military">Back to List</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/military">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Military Profile</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Info */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={person.avatarUrl} alt={person.name} />
                <AvatarFallback className="text-2xl">
                  {person.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{person.name}</CardTitle>
            <CardDescription>{person.rank}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <Badge
                variant={person.status === 'Active' ? 'default' : 'secondary'}
              >
                {person.status}
              </Badge>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <div className="grid grid-cols-3 text-sm">
                <span className="text-muted-foreground font-medium">Unit:</span>
                <span className="col-span-2">{person.unit}</span>
              </div>
              <div className="grid grid-cols-3 text-sm">
                <span className="text-muted-foreground font-medium flex items-center gap-2">
                  <Mail className="h-3 w-3" /> Email:
                </span>
                <span className="col-span-2 break-words">{person.email}</span>
              </div>
              <div className="grid grid-cols-3 text-sm">
                <span className="text-muted-foreground font-medium flex items-center gap-2">
                  <Phone className="h-3 w-3" /> Phone:
                </span>
                <span className="col-span-2">{person.phone}</span>
              </div>
            </div>

            <div className="pt-4">
              <EditMilitaryDialog
                military={person}
                trigger={<Button className="w-full">Edit Profile</Button>}
              />
            </div>
          </CardContent>
        </Card>

        {/* Unavailabilities */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Unavailabilities</CardTitle>
              <CardDescription>
                Manage periods of absence for this military.
              </CardDescription>
            </div>
            <ManageUnavailabilityDialog militaryId={person.id} />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {personUnavailabilities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      No unavailabilities recorded.
                    </TableCell>
                  </TableRow>
                ) : (
                  personUnavailabilities.map((unavailability) => {
                    const type = unavailabilityTypes.find(
                      (t) => t.id === unavailability.unavailabilityTypeId,
                    )
                    return (
                      <TableRow key={unavailability.id}>
                        <TableCell className="font-medium">
                          {type?.name || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          {format(unavailability.startDate, 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          {format(unavailability.endDate, 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          {unavailability.reasonDetails || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <EditUnavailabilityDialog
                              unavailability={unavailability}
                            />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Unavailability
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this
                                    unavailability record?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      deleteUnavailability(unavailability.id)
                                    }
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
