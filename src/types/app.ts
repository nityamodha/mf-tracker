import type { Database } from "@/types/database";

export type UserRole = Database["public"]["Enums"]["user_role"];
export type TaskStatus = Database["public"]["Enums"]["task_status"];
export type TaskPriority = Database["public"]["Enums"]["task_priority"];

export type UserProfile = Omit<Database["public"]["Tables"]["users"]["Row"], "password">;
export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type ChannelPartner = Database["public"]["Tables"]["channel_partners"]["Row"];
export type Amc = Database["public"]["Tables"]["amcs"]["Row"];
export type TaskType = Database["public"]["Tables"]["task_types"]["Row"];

export type TaskListItem = Database["public"]["Tables"]["tasks"]["Row"] & {
  client?: Client | null;
  channel_partner?: ChannelPartner | null;
  rm?: Pick<UserProfile, "id" | "full_name"> | null;
  assignee?: Pick<UserProfile, "id" | "full_name"> | null;
  task_type?: Pick<TaskType, "id" | "name" | "default_sla_hours"> | null;
  amc?: Pick<Amc, "id" | "name"> | null;
  creator?: Pick<UserProfile, "id" | "full_name"> | null;
};

export type TaskComment = Database["public"]["Tables"]["task_comments"]["Row"] & {
  user?: Pick<UserProfile, "id" | "full_name" | "email"> | null;
};

export type TaskAttachment = Database["public"]["Tables"]["task_attachments"]["Row"] & {
  uploader?: Pick<UserProfile, "id" | "full_name"> | null;
  signed_url?: string | null;
};

export type TaskActivity = Database["public"]["Tables"]["task_activity_logs"]["Row"] & {
  actor?: Pick<UserProfile, "id" | "full_name"> | null;
};

export type TaskDetail = TaskListItem & {
  comments: TaskComment[];
  attachments: TaskAttachment[];
  activity: TaskActivity[];
};

export type DashboardCard = {
  label: string;
  value: number;
  helper: string;
};

export type DashboardDataset = {
  name: string;
  value: number;
};

export type DashboardData = {
  cards: DashboardCard[];
  statusChart: DashboardDataset[];
  rmChart: DashboardDataset[];
  amcChart: DashboardDataset[];
  recentTasks: TaskListItem[];
  overdueTasks: TaskListItem[];
};

export type TaskLookupData = {
  clients: Client[];
  channelPartners: ChannelPartner[];
  users: UserProfile[];
  amcs: Amc[];
  taskTypes: TaskType[];
};
