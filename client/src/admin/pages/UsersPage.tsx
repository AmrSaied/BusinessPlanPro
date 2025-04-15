import { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Plus, Edit, Trash2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const UsersPage = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    username: "",
    email: "",
    role: "",
    isActive: true,
  });

  // Fetch users data from API
  const {
    data: users,
    isLoading,
    error,
  } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: getQueryFn(),
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<User>) => {
      if (!selectedUser) return null;
      const res = await apiRequest("PATCH", `/api/admin/users/${selectedUser.id}`, userData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "User updated",
        description: "User has been updated successfully",
      });
      setIsEditModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser) return null;
      await apiRequest("DELETE", `/api/admin/users/${selectedUser.id}`);
    },
    onSuccess: () => {
      toast({
        title: "User deleted",
        description: "User has been deleted successfully",
      });
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users
    ? users.filter((user) => {
        const matchesSearch =
          searchQuery === "" ||
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesRole =
          roleFilter === "" || user.role === roleFilter;

        return matchesSearch && matchesRole;
      })
    : [];

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditUserForm({
      username: user.username,
      email: user.email || "",
      role: user.role || "user",
      isActive: user.isActive !== false, // default to true if not specified
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleUpdateUser = () => {
    updateUserMutation.mutate(editUserForm);
  };

  const handleDeleteUser = () => {
    deleteUserMutation.mutate();
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load users data. Please try again later.
          </AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts, permissions and access in your system.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              A list of all users registered in your system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    className="pl-10 w-full md:w-80"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4" /> Add New User
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableCaption>A list of all users in your system.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.email || "—"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={user.role === "admin" ? "destructive" : "default"}
                          >
                            {user.role || "user"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.isActive !== false ? "outline" : "secondary"
                            }
                          >
                            {user.isActive !== false ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.createdAt
                            ? format(new Date(user.createdAt), "PP")
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditModal(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteModal(user)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Make changes to the user details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={editUserForm.username}
                onChange={(e) =>
                  setEditUserForm({ ...editUserForm, username: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editUserForm.email}
                onChange={(e) =>
                  setEditUserForm({ ...editUserForm, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={editUserForm.role}
                onValueChange={(value) =>
                  setEditUserForm({ ...editUserForm, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={editUserForm.isActive ? "active" : "inactive"}
                onValueChange={(value) =>
                  setEditUserForm({
                    ...editUserForm,
                    isActive: value === "active",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateUser}
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <p>
              Username: <strong>{selectedUser?.username}</strong>
            </p>
            {selectedUser?.email && (
              <p>
                Email: <strong>{selectedUser.email}</strong>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete User"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default UsersPage;