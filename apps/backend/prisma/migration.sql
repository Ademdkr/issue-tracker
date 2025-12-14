-- Prisma Migration: Initial database schema
-- Run this SQL to set up the complete database structure

BEGIN;

-- Extension für gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create all tables with foreign key constraints
CREATE TABLE IF NOT EXISTS users (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    surname TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('reporter','developer','manager','admin')) DEFAULT 'reporter',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('open','closed')) DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT projects_created_by_fk FOREIGN KEY (created_by) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS labels (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT labels_project_fk FOREIGN KEY (project_id) REFERENCES projects (id),
    CONSTRAINT labels_project_name_unique UNIQUE (project_id, name)
);

CREATE TABLE IF NOT EXISTS tickets (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    reporter_id UUID NOT NULL,
    assignee_id UUID NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('open','in_progress','resolved','closed')) DEFAULT 'open',
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('low','medium','high','critical')) DEFAULT 'low',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT tickets_project_fk FOREIGN KEY (project_id) REFERENCES projects (id),
    CONSTRAINT tickets_reporter_fk FOREIGN KEY (reporter_id) REFERENCES users (id),
    CONSTRAINT tickets_assignee_fk FOREIGN KEY (assignee_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS ticket_labels (
    ticket_id UUID NOT NULL,
    label_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY (ticket_id, label_id),
    CONSTRAINT ticket_labels_ticket_fk FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE,
    CONSTRAINT ticket_labels_label_fk FOREIGN KEY (label_id) REFERENCES labels (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_members (
    project_id UUID NOT NULL,
    user_id UUID NOT NULL,
    added_by UUID NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY (project_id, user_id),
    CONSTRAINT project_members_project_fk FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
    CONSTRAINT project_members_user_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT project_members_added_by_fk FOREIGN KEY (added_by) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS comments (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL,
    author_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT comments_ticket_fk FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE,
    CONSTRAINT comments_author_fk FOREIGN KEY (author_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS ticket_activity (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL,
    actor_id UUID NOT NULL,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('status_change','assignee_change','label_added','label_removed')),
    detail JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT ticket_activity_ticket_fk FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE,
    CONSTRAINT ticket_activity_actor_fk FOREIGN KEY (actor_id) REFERENCES users (id)
);

-- Create all indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects (created_by);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects (status);
CREATE INDEX IF NOT EXISTS idx_labels_project_id ON labels (project_id);
CREATE INDEX IF NOT EXISTS idx_labels_project_name ON labels (project_id, name);
CREATE INDEX IF NOT EXISTS idx_tickets_project_id ON tickets (project_id);
CREATE INDEX IF NOT EXISTS idx_tickets_project_status ON tickets (project_id, status);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets (status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets (priority);
CREATE INDEX IF NOT EXISTS idx_tickets_assignee ON tickets (assignee_id);
CREATE INDEX IF NOT EXISTS idx_tickets_reporter ON tickets (reporter_id);
CREATE INDEX IF NOT EXISTS idx_ticket_labels_label_id ON ticket_labels (label_id);
CREATE INDEX IF NOT EXISTS idx_ticket_labels_ticket_id ON ticket_labels (ticket_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members (user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_added_by ON project_members (added_by);
CREATE INDEX IF NOT EXISTS idx_comments_ticket_id ON comments (ticket_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments (author_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments (created_at);
CREATE INDEX IF NOT EXISTS idx_ticket_activity_ticket_id ON ticket_activity (ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_activity_actor_id ON ticket_activity (actor_id);
CREATE INDEX IF NOT EXISTS idx_ticket_activity_created_at ON ticket_activity (created_at);
CREATE INDEX IF NOT EXISTS idx_ticket_activity_detail_gin ON ticket_activity USING GIN (detail);

COMMIT;
