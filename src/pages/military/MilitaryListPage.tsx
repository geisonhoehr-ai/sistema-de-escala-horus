import { useState } from 'react'
import { Link } from 'react-router-dom'
import useDataStore from '@/stores/data.store'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, MoreHorizontal } from 'lucide-react'
import { ManageMilitaryDialog } from '@/components/ManageMilitaryDialog'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function MilitaryListPage() {
  const { military } = useDataStore()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredMilitary = military.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.rank.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.unit.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Military Personnel
        </h1>
        <ManageMilitaryDialog />
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, rank or unit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Rank</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMilitary.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  No military personnel found.
                </TableCell>
              </TableRow>
            ) : (
              filteredMilitary.map((person) => (
                <TableRow key={person.id}>
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={person.avatarUrl} alt={person.name} />
                      <AvatarFallback>
                        {person.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link
                      to={`/military/${person.id}`}
                      className="hover:underline"
                    >
                      {person.name}
                    </Link>
                  </TableCell>
                  <TableCell>{person.rank}</TableCell>
                  <TableCell>{person.unit}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        person.status === 'Active' ? 'default' : 'secondary'
                      }
                    >
                      {person.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="text-xs">{person.email}</div>
                    <div className="text-xs">{person.phone}</div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/military/${person.id}`}>
                            View Profile
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
