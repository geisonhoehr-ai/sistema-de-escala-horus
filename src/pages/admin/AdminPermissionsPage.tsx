import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Check, X } from 'lucide-react'

export default function AdminPermissionsPage() {
  const roles = [
    {
      name: 'Admin',
      description: 'Full access to all system features',
      permissions: {
        manageUsers: true,
        manageScales: true,
        manageMilitary: true,
        manageConfigs: true,
      },
    },
    {
      name: 'Militar',
      description: 'Access to own profile and scale viewing',
      permissions: {
        manageUsers: false,
        manageScales: false,
        manageMilitary: false,
        manageConfigs: false,
      },
    },
    {
      name: 'User',
      description: 'Limited read-only access',
      permissions: {
        manageUsers: false,
        manageScales: false,
        manageMilitary: false,
        manageConfigs: false,
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Roles & Permissions
        </h1>
        <p className="text-muted-foreground">
          Overview of system roles and their access levels.
        </p>
      </div>

      <div className="grid gap-6">
        {roles.map((role) => (
          <Card key={role.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{role.name}</CardTitle>
                <Badge variant="outline">{role.name}</Badge>
              </div>
              <CardDescription>{role.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Permission</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Manage Users</TableCell>
                    <TableCell className="text-right">
                      {role.permissions.manageUsers ? (
                        <Check className="ml-auto h-4 w-4 text-green-500" />
                      ) : (
                        <X className="ml-auto h-4 w-4 text-red-500" />
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Manage Scales</TableCell>
                    <TableCell className="text-right">
                      {role.permissions.manageScales ? (
                        <Check className="ml-auto h-4 w-4 text-green-500" />
                      ) : (
                        <X className="ml-auto h-4 w-4 text-red-500" />
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Manage Military Personnel</TableCell>
                    <TableCell className="text-right">
                      {role.permissions.manageMilitary ? (
                        <Check className="ml-auto h-4 w-4 text-green-500" />
                      ) : (
                        <X className="ml-auto h-4 w-4 text-red-500" />
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Manage Configurations</TableCell>
                    <TableCell className="text-right">
                      {role.permissions.manageConfigs ? (
                        <Check className="ml-auto h-4 w-4 text-green-500" />
                      ) : (
                        <X className="ml-auto h-4 w-4 text-red-500" />
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
