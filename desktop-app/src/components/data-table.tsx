import * as React from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { toast } from "sonner";

import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GripVerticalIcon,
  EllipsisVerticalIcon,
  Columns3Icon,
  ChevronDownIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TrendingUpIcon,
  Loader2Icon,
} from "lucide-react";
import { projectsApi, type Project } from "../api/projects";

function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({ id });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent cursor-grab active:cursor-grabbing"
    >
      <GripVerticalIcon className="size-3 text-muted-foreground" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

function DraggableRow({ row }: { row: Row<Project> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function RecentProjectsTable({ limit }: { limit?: number }) {
  const [data, setData] = React.useState<Project[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Create Project Drawer State
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const [newProject, setNewProject] = React.useState({
    name: "",
    type: "",
    description: "",
  });

  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const res = await projectsApi.getAll();
      setData(res);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim() || !newProject.type.trim()) {
      toast.warning("Please fill in Name and Type fields");
      return;
    }

    try {
      setIsCreating(true);
      const created = await projectsApi.create(newProject);
      toast.success("Project created successfully");
      setData((prev) => [created, ...prev]);
      setNewProject({ name: "", type: "", description: "" });
      setIsCreateOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create project");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateProject = async (
    id: string,
    name: string,
    type: string,
    description: string
  ) => {
    try {
      const updated = await projectsApi.update(id, { name, type, description });
      toast.success("Project updated successfully");
      setData((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update project");
      throw err;
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await projectsApi.remove(id);
      toast.success("Project deleted successfully");
      setData((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete project");
    }
  };

  const visibleData = React.useMemo(() => {
    if (limit && data.length > limit) {
      return data.slice(0, limit);
    }
    return data;
  }, [data, limit]);

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => visibleData?.map(({ id }) => id) || [],
    [visibleData]
  );

  const columns = React.useMemo<ColumnDef<Project>[]>(
    () => [
      {
        id: "drag",
        header: () => null,
        cell: ({ row }) => <DragHandle id={row.original.id} />,
      },
      {
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected()
                  ? true
                  : table.getIsSomePageRowsSelected()
                  ? "indeterminate"
                  : false
              }
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: "Project Name",
        cell: ({ row }) => {
          return <TableCellViewer item={row.original} onUpdate={handleUpdateProject} />;
        },
        enableHiding: false,
      },
      {
        accessorKey: "type",
        header: "Project Type",
        cell: ({ row }) => (
          <div className="w-32">
            <Badge variant="secondary" className="px-1.5 font-normal">
              {row.original.type}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <div className="max-w-[300px] truncate text-muted-foreground text-sm">
            {row.original.description}
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt);
          return (
            <div className="text-sm text-muted-foreground">
              {date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                size="icon"
              >
                <EllipsisVerticalIcon />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => handleDeleteProject(row.original.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                Delete project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: visibleData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((prevData) => {
        const oldIndex = prevData.findIndex((p) => p.id === active.id);
        const newIndex = prevData.findIndex((p) => p.id === over.id);
        return arrayMove(prevData, oldIndex, newIndex);
      });
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2Icon className="mr-2 h-6 w-6 animate-spin text-primary" />
        <span>Loading project files...</span>
      </div>
    );
  }

  return (
    <Tabs defaultValue="all" className="w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="project-view-selector" className="sr-only">
          Filter Projects
        </Label>
        <Select defaultValue="all">
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="project-view-selector"
          >
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="web">Web Apps</SelectItem>
              <SelectItem value="mobile">Mobile Apps</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <TabsList className="hidden @4xl/main:flex">
          <TabsTrigger value="all">All Projects</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns3Icon className="mr-2 size-4" />
                Columns
                <ChevronDownIcon className="ml-2 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            <PlusIcon className="mr-2 size-4" />
            <span>New Project</span>
          </Button>
        </div>
      </div>

      <TabsContent
        value="all"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No projects found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} project(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeftIcon className="size-4" />
              </Button>
              <div className="text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </div>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRightIcon className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* New Project Drawer */}
      <Drawer open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DrawerContent className="max-w-md mx-auto">
          <form onSubmit={handleCreateProject}>
            <DrawerHeader>
              <DrawerTitle>Create New Project</DrawerTitle>
              <DrawerDescription>
                Add a new engineering project to your workspace.
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex flex-col gap-4 p-4 text-sm">
              <div className="flex flex-col gap-2">
                <Label htmlFor="new-name">Project Name</Label>
                <Input
                  id="new-name"
                  placeholder="e.g. Flight Controller Unit"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="new-type">Project Type</Label>
                <Input
                  id="new-type"
                  placeholder="e.g. Embedded C / Assembly"
                  value={newProject.type}
                  onChange={(e) =>
                    setNewProject({ ...newProject, type: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="new-desc">Description</Label>
                <Input
                  id="new-desc"
                  placeholder="Brief description of the project"
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({ ...newProject, description: e.target.value })
                  }
                />
              </div>
            </div>
            <DrawerFooter>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Project"
                )}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </Tabs>
  );
}

function TableCellViewer({
  item,
  onUpdate,
}: {
  item: Project;
  onUpdate: (
    id: string,
    name: string,
    type: string,
    description: string
  ) => Promise<void>;
}) {
  const [name, setName] = React.useState(item.name);
  const [type, setType] = React.useState(item.type);
  const [description, setDescription] = React.useState(item.description);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  const isMobile = useIsMobile();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !type.trim()) {
      toast.warning("Please fill in Name and Type fields");
      return;
    }
    try {
      setIsSaving(true);
      await onUpdate(item.id, name, type, description);
      setIsOpen(false);
    } catch (err) {
      // toast is already handled in parent
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button
          variant="link"
          className="w-fit px-0 text-left font-medium text-foreground hover:no-underline"
        >
          {item.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent className={isMobile ? "max-h-[85vh]" : "max-w-md ml-auto h-full"}>
        <form onSubmit={handleSave} className="flex flex-col h-full">
          <DrawerHeader className="gap-1">
            <DrawerTitle>{item.name}</DrawerTitle>
            <DrawerDescription>
              Project Analytics & Meta details
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm flex-1">
            {!isMobile && (
              <>
                <ChartContainer config={chartConfig}>
                  <AreaChart
                    accessibilityLayer
                    data={chartData}
                    margin={{ left: 0, right: 10 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="month" hide />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Area
                      dataKey="commits"
                      type="natural"
                      fill="var(--color-desktop)"
                      fillOpacity={0.4}
                      stroke="var(--color-desktop)"
                    />
                  </AreaChart>
                </ChartContainer>
                <Separator />
                <div className="grid gap-2">
                  <div className="flex gap-2 leading-none font-medium text-slate-200">
                    Active deployment velocity up by 12.4%{" "}
                    <TrendingUpIcon className="size-4" />
                  </div>
                  <div className="text-muted-foreground">{item.description}</div>
                </div>
                <Separator />
              </>
            )}
            <div className="flex flex-col gap-3">
              <Label htmlFor={`edit-name-${item.id}`}>Project Name</Label>
              <Input
                id={`edit-name-${item.id}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor={`edit-type-${item.id}`}>Type</Label>
              <Input
                id={`edit-type-${item.id}`}
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor={`edit-desc-${item.id}`}>Description</Label>
              <Input
                id={`edit-desc-${item.id}`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DrawerFooter className="mt-auto border-t p-4 flex-row gap-2">
            <Button type="submit" className="flex-1" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="flex-1">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}

// Side-Drawer Demo Chart Config & Dummy Data
const chartData = [
  { month: "Jan", commits: 45 },
  { month: "Feb", commits: 89 },
  { month: "Mar", commits: 120 },
  { month: "Apr", commits: 78 },
  { month: "May", commits: 150 },
];

const chartConfig = {
  desktop: {
    label: "Commits",
    color: "var(--primary)",
  },
} satisfies ChartConfig;
