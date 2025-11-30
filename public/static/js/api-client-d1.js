/**
 * MuseFlow V4.2 - D1 API Client
 * RESTful API client for Cloudflare D1 Database
 */

class APIClient {
    constructor() {
        this.baseURL = '/api'
        this.userId = 2 // Default user ID (admin@museflow.com)
    }

    /**
     * Generic API request wrapper
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        }

        try {
            const response = await fetch(url, config)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`)
            }

            return data
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error)
            throw error
        }
    }

    // ========================================================================
    // PROJECTS API
    // ========================================================================

    /**
     * Get all projects
     */
    async getProjects(status = null) {
        let endpoint = `/projects?userId=${this.userId}`
        if (status) endpoint += `&status=${status}`
        return await this.request(endpoint)
    }

    /**
     * Get single project with tasks
     */
    async getProject(projectId) {
        return await this.request(`/projects/${projectId}`)
    }

    /**
     * Create new project
     */
    async createProject(projectData) {
        return await this.request('/projects', {
            method: 'POST',
            body: JSON.stringify({
                user_id: this.userId,
                ...projectData
            })
        })
    }

    /**
     * Update project
     */
    async updateProject(projectId, projectData) {
        return await this.request(`/projects/${projectId}`, {
            method: 'PUT',
            body: JSON.stringify(projectData)
        })
    }

    /**
     * Delete project
     */
    async deleteProject(projectId) {
        return await this.request(`/projects/${projectId}`, {
            method: 'DELETE'
        })
    }

    /**
     * Get urgent projects (D-7 or less)
     */
    async getUrgentProjects() {
        return await this.request('/projects/urgent')
    }

    // ========================================================================
    // TASKS API
    // ========================================================================

    /**
     * Get all tasks for a project
     */
    async getTasks(projectId) {
        return await this.request(`/tasks?project_id=${projectId}`)
    }

    /**
     * Create new task
     */
    async createTask(taskData) {
        return await this.request('/tasks', {
            method: 'POST',
            body: JSON.stringify({
                user_id: this.userId,
                ...taskData
            })
        })
    }

    /**
     * Update task
     */
    async updateTask(taskId, taskData) {
        return await this.request(`/tasks/${taskId}`, {
            method: 'PUT',
            body: JSON.stringify(taskData)
        })
    }

    /**
     * Delete task
     */
    async deleteTask(taskId) {
        return await this.request(`/tasks/${taskId}`, {
            method: 'DELETE'
        })
    }

    // ========================================================================
    // COMMENTS API
    // ========================================================================

    /**
     * Get comments for a task
     */
    async getComments(taskId) {
        return await this.request(`/comments?taskId=${taskId}`)
    }

    /**
     * Create new comment
     */
    async createComment(commentData) {
        return await this.request('/comments', {
            method: 'POST',
            body: JSON.stringify({
                user_id: this.userId,
                ...commentData
            })
        })
    }

    /**
     * Update comment
     */
    async updateComment(commentId, content) {
        return await this.request(`/comments/${commentId}`, {
            method: 'PUT',
            body: JSON.stringify({ content })
        })
    }

    /**
     * Delete comment
     */
    async deleteComment(commentId) {
        return await this.request(`/comments/${commentId}`, {
            method: 'DELETE'
        })
    }

    // ========================================================================
    // MIGRATION HELPERS (localStorage → D1)
    // ========================================================================

    /**
     * Migrate localStorage projects to D1
     */
    async migrateProjectsFromLocalStorage() {
        const projects = JSON.parse(localStorage.getItem('museflow_projects') || '[]')
        
        if (projects.length === 0) {
            console.log('No projects to migrate')
            return { migrated: 0, total: 0 }
        }

        let migrated = 0
        for (const project of projects) {
            try {
                await this.createProject({
                    title: project.title,
                    description: project.description || '',
                    status: project.status || 'draft',
                    workflow_data: project.workflow_data || null,
                    budget_amount: project.budget || 0
                })
                migrated++
            } catch (error) {
                console.error(`Failed to migrate project: ${project.title}`, error)
            }
        }

        return { migrated, total: projects.length }
    }

    /**
     * Migrate localStorage tasks to D1
     */
    async migrateTasksFromLocalStorage(projectId) {
        const storageKey = `museflow_tasks_${projectId}`
        const tasks = JSON.parse(localStorage.getItem(storageKey) || '[]')
        
        if (tasks.length === 0) {
            return { migrated: 0, total: 0 }
        }

        let migrated = 0
        for (const task of tasks) {
            try {
                await this.createTask({
                    project_id: projectId,
                    title: task.title,
                    description: task.description || '',
                    phase: task.phase || 'planning',
                    status: task.status || 'pending',
                    assignee: task.assignee || '',
                    due_date: task.dueDate || null,
                    checklist: task.checklist || []
                })
                migrated++
            } catch (error) {
                console.error(`Failed to migrate task: ${task.title}`, error)
            }
        }

        return { migrated, total: tasks.length }
    }

    /**
     * Clear all localStorage data (after migration)
     */
    clearLocalStorage() {
        const keys = Object.keys(localStorage)
        const museflowKeys = keys.filter(k => k.startsWith('museflow_'))
        
        museflowKeys.forEach(key => localStorage.removeItem(key))
        
        return museflowKeys.length
    }
}

// Global instance
window.apiClient = new APIClient()

// Helper: Show loading indicator
function showLoading(element) {
    if (!element) return
    element.style.opacity = '0.5'
    element.style.pointerEvents = 'none'
}

// Helper: Hide loading indicator
function hideLoading(element) {
    if (!element) return
    element.style.opacity = '1'
    element.style.pointerEvents = 'auto'
}

// Helper: Show error message
function showError(message) {
    if (window.notificationSystem) {
        notificationSystem.showInAppNotification(message, 'error')
    } else {
        alert(message)
    }
}

// Helper: Show success message
function showSuccess(message) {
    if (window.notificationSystem) {
        notificationSystem.showInAppNotification(message, 'success')
    }
}

console.log('[API Client] D1 API Client initialized')
