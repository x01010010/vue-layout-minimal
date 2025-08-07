/**
 * Enhanced Draft Manager Service
 * Provides comprehensive draft management with versioning, compression, and cross-tab sync
 */

import type {
  NewProjectFormData as ProjectFormData,
  ProjectCreationDraft,
  DraftMetadata,
  DraftRestorationOptions,
  NavigationState
} from '../types/project-creation'

// =============================================================================
// Types and Interfaces
// =============================================================================

export interface DraftManagerConfig {
  storageKey: string
  maxDrafts: number
  maxVersions: number
  compressionEnabled: boolean
  encryptionEnabled: boolean
  crossTabSyncEnabled: boolean
  cleanupInterval: number // milliseconds
  maxAge: number // milliseconds (30 days default)
}

export interface DraftVersion {
  id: string
  timestamp: number
  formData: ProjectFormData
  navigationState: Pick<NavigationState, 'currentStep' | 'totalSteps'>
  checksum: string
}

export interface EnhancedDraftMetadata extends DraftMetadata {
  versions: DraftVersion[]
  size: number // bytes
  compressed: boolean
  encrypted: boolean
  tags: string[]
  progress: number // 0-100 percentage
  lastAccessedAt: number
}

export interface EnhancedProjectCreationDraft {
  metadata: EnhancedDraftMetadata
  currentVersion: DraftVersion
}

export interface StorageInfo {
  used: number // bytes
  available: number // bytes
  quota: number // bytes
  draftsCount: number
  oldestDraft: number // timestamp
  newestDraft: number // timestamp
}

export interface DraftSearchOptions {
  query?: string
  tags?: string[]
  dateRange?: {
    start: number
    end: number
  }
  progressRange?: {
    min: number
    max: number
  }
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'progress'
  sortOrder?: 'asc' | 'desc'
  limit?: number
}

export interface DraftExportOptions {
  format: 'json' | 'compressed' | 'encrypted'
  includeVersions: boolean
  includeMetadata: boolean
}

// =============================================================================
// Draft Manager Class
// =============================================================================

export class DraftManager {
  private config: DraftManagerConfig
  private cleanupTimer: number | null = null
  private syncListeners: Set<(event: StorageEvent) => void> = new Set()

  constructor(config: Partial<DraftManagerConfig> = {}) {
    this.config = {
      storageKey: 'vue-layout-project-creation-drafts-v2',
      maxDrafts: 10,
      maxVersions: 5,
      compressionEnabled: true,
      encryptionEnabled: false,
      crossTabSyncEnabled: true,
      cleanupInterval: 60000, // 1 minute
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      ...config
    }

    this.initialize()
  }

  // =============================================================================
  // Initialization and Cleanup
  // =============================================================================

  private initialize(): void {
    this.startCleanupTimer()
    
    if (this.config.crossTabSyncEnabled) {
      this.setupCrossTabSync()
    }

    // Migrate old drafts if they exist
    this.migrateOldDrafts()
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = window.setInterval(() => {
      this.cleanupOldDrafts()
    }, this.config.cleanupInterval)
  }

  private setupCrossTabSync(): void {
    const syncHandler = (event: StorageEvent) => {
      if (event.key === this.config.storageKey) {
        this.syncListeners.forEach(listener => listener(event))
      }
    }

    window.addEventListener('storage', syncHandler)
  }

  public destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }

    this.syncListeners.clear()
  }

  // =============================================================================
  // Core Draft Operations
  // =============================================================================

  public async saveDraft(
    formData: ProjectFormData,
    navigationState: Pick<NavigationState, 'currentStep' | 'totalSteps'>,
    options: {
      title?: string
      description?: string
      tags?: string[]
      draftId?: string
    } = {}
  ): Promise<string> {
    try {
      const now = Date.now()
      const draftId = options.draftId || `draft-${now}`
      
      // Create version
      const version: DraftVersion = {
        id: `${draftId}-v${now}`,
        timestamp: now,
        formData: this.deepClone(formData),
        navigationState: { ...navigationState },
        checksum: this.generateChecksum(formData)
      }

      // Get existing draft or create new one
      const existingDrafts = await this.getAllDrafts()
      const existingDraft = existingDrafts.find(d => d.metadata.id === draftId)

      let draft: EnhancedProjectCreationDraft

      if (existingDraft) {
        // Update existing draft
        const versions = [...existingDraft.metadata.versions, version]
          .slice(-this.config.maxVersions) // Keep only latest versions

        draft = {
          metadata: {
            ...existingDraft.metadata,
            updatedAt: now,
            lastAccessedAt: now,
            versions,
            title: options.title || existingDraft.metadata.title,
            description: options.description || existingDraft.metadata.description,
            tags: options.tags || existingDraft.metadata.tags,
            progress: this.calculateProgress(formData, navigationState)
          },
          currentVersion: version
        }
      } else {
        // Create new draft
        draft = {
          metadata: {
            id: draftId,
            createdAt: now,
            updatedAt: now,
            lastAccessedAt: now,
            title: options.title || formData.generalInfo?.name || 'Untitled Project',
            description: options.description || formData.generalInfo?.description,
            version: '2.0.0',
            versions: [version],
            size: 0,
            compressed: this.config.compressionEnabled,
            encrypted: this.config.encryptionEnabled,
            tags: options.tags || [],
            progress: this.calculateProgress(formData, navigationState)
          },
          currentVersion: version
        }
      }

      // Calculate size
      draft.metadata.size = this.calculateSize(draft)

      // Save to storage
      await this.saveDraftToStorage(draft)

      return draftId
    } catch (error) {
      console.error('Failed to save draft:', error)
      throw new Error(`Failed to save draft: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  public async loadDraft(
    draftId: string,
    options: DraftRestorationOptions & { versionId?: string } = {
      restoreFormData: true,
      restoreStepPosition: true,
      mergeWithCurrent: false
    }
  ): Promise<{
    formData: ProjectFormData
    navigationState: Pick<NavigationState, 'currentStep' | 'totalSteps'>
  }> {
    try {
      const drafts = await this.getAllDrafts()
      const draft = drafts.find(d => d.metadata.id === draftId)

      if (!draft) {
        throw new Error(`Draft ${draftId} not found`)
      }

      // Update last accessed time
      draft.metadata.lastAccessedAt = Date.now()
      await this.saveDraftToStorage(draft)

      // Get specific version or current version
      let version = draft.currentVersion
      if (options.versionId) {
        const specificVersion = draft.metadata.versions.find(v => v.id === options.versionId)
        if (specificVersion) {
          version = specificVersion
        }
      }

      return {
        formData: this.deepClone(version.formData),
        navigationState: { ...version.navigationState }
      }
    } catch (error) {
      console.error('Failed to load draft:', error)
      throw new Error(`Failed to load draft: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  public async deleteDraft(draftId: string): Promise<void> {
    try {
      const drafts = await this.getAllDrafts()
      const filteredDrafts = drafts.filter(d => d.metadata.id !== draftId)
      await this.saveAllDrafts(filteredDrafts)
    } catch (error) {
      console.error('Failed to delete draft:', error)
      throw new Error(`Failed to delete draft: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  public async getAllDrafts(): Promise<EnhancedProjectCreationDraft[]> {
    try {
      const stored = localStorage.getItem(this.config.storageKey)
      if (!stored) return []

      const data = JSON.parse(stored)
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.warn('Failed to load drafts:', error)
      return []
    }
  }

  public async getDraftMetadata(): Promise<EnhancedDraftMetadata[]> {
    const drafts = await this.getAllDrafts()
    return drafts.map(d => d.metadata)
  }

  // =============================================================================
  // Search and Filter Operations
  // =============================================================================

  public async searchDrafts(options: DraftSearchOptions = {}): Promise<EnhancedDraftMetadata[]> {
    const drafts = await this.getDraftMetadata()
    let filtered = [...drafts]

    // Text search
    if (options.query) {
      const query = options.query.toLowerCase()
      filtered = filtered.filter(draft =>
        draft.title.toLowerCase().includes(query) ||
        (draft.description && draft.description.toLowerCase().includes(query)) ||
        draft.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Tag filter
    if (options.tags && options.tags.length > 0) {
      filtered = filtered.filter(draft =>
        options.tags!.some(tag => draft.tags.includes(tag))
      )
    }

    // Date range filter
    if (options.dateRange) {
      filtered = filtered.filter(draft =>
        draft.createdAt >= options.dateRange!.start &&
        draft.createdAt <= options.dateRange!.end
      )
    }

    // Progress range filter
    if (options.progressRange) {
      filtered = filtered.filter(draft =>
        draft.progress >= options.progressRange!.min &&
        draft.progress <= options.progressRange!.max
      )
    }

    // Sort
    if (options.sortBy) {
      filtered.sort((a, b) => {
        const aVal = a[options.sortBy!]
        const bVal = b[options.sortBy!]
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
        return options.sortOrder === 'desc' ? -comparison : comparison
      })
    }

    // Limit
    if (options.limit) {
      filtered = filtered.slice(0, options.limit)
    }

    return filtered
  }

  // =============================================================================
  // Storage Management
  // =============================================================================

  public async getStorageInfo(): Promise<StorageInfo> {
    const drafts = await this.getAllDrafts()
    const totalSize = drafts.reduce((sum, draft) => sum + draft.metadata.size, 0)
    
    // Estimate available storage (this is approximate)
    const quota = this.estimateStorageQuota()
    
    return {
      used: totalSize,
      available: quota - totalSize,
      quota,
      draftsCount: drafts.length,
      oldestDraft: drafts.length > 0 ? Math.min(...drafts.map(d => d.metadata.createdAt)) : 0,
      newestDraft: drafts.length > 0 ? Math.max(...drafts.map(d => d.metadata.updatedAt)) : 0
    }
  }

  public async cleanupOldDrafts(): Promise<number> {
    const drafts = await this.getAllDrafts()
    const now = Date.now()
    const cutoff = now - this.config.maxAge

    const validDrafts = drafts.filter(draft => draft.metadata.createdAt > cutoff)
    const removedCount = drafts.length - validDrafts.length

    if (removedCount > 0) {
      await this.saveAllDrafts(validDrafts)
    }

    return removedCount
  }

  public async optimizeStorage(): Promise<void> {
    const drafts = await this.getAllDrafts()
    
    // Remove duplicate versions based on checksum
    const optimizedDrafts = drafts.map(draft => {
      const uniqueVersions = draft.metadata.versions.filter((version, index, array) =>
        array.findIndex(v => v.checksum === version.checksum) === index
      )

      return {
        ...draft,
        metadata: {
          ...draft.metadata,
          versions: uniqueVersions.slice(-this.config.maxVersions)
        }
      }
    })

    await this.saveAllDrafts(optimizedDrafts)
  }

  // =============================================================================
  // Import/Export Operations
  // =============================================================================

  public async exportDraft(
    draftId: string,
    options: DraftExportOptions = {
      format: 'json',
      includeVersions: true,
      includeMetadata: true
    }
  ): Promise<string> {
    const drafts = await this.getAllDrafts()
    const draft = drafts.find(d => d.metadata.id === draftId)

    if (!draft) {
      throw new Error(`Draft ${draftId} not found`)
    }

    let exportData: any = {
      currentVersion: draft.currentVersion
    }

    if (options.includeMetadata) {
      exportData.metadata = draft.metadata
    }

    if (options.includeVersions) {
      exportData.versions = draft.metadata.versions
    }

    switch (options.format) {
      case 'json':
        return JSON.stringify(exportData, null, 2)
      case 'compressed':
        return this.compress(JSON.stringify(exportData))
      case 'encrypted':
        return this.encrypt(JSON.stringify(exportData))
      default:
        return JSON.stringify(exportData, null, 2)
    }
  }

  public async importDraft(data: string, format: 'json' | 'compressed' | 'encrypted' = 'json'): Promise<string> {
    try {
      let parsedData: any

      switch (format) {
        case 'compressed':
          parsedData = JSON.parse(this.decompress(data))
          break
        case 'encrypted':
          parsedData = JSON.parse(this.decrypt(data))
          break
        default:
          parsedData = JSON.parse(data)
      }

      // Generate new ID for imported draft
      const newId = `imported-${Date.now()}`
      const now = Date.now()

      const draft: EnhancedProjectCreationDraft = {
        metadata: {
          ...parsedData.metadata,
          id: newId,
          createdAt: now,
          updatedAt: now,
          lastAccessedAt: now,
          title: `${parsedData.metadata?.title || 'Imported Draft'} (Imported)`
        },
        currentVersion: parsedData.currentVersion
      }

      await this.saveDraftToStorage(draft)
      return newId
    } catch (error) {
      throw new Error(`Failed to import draft: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // =============================================================================
  // Cross-Tab Synchronization
  // =============================================================================

  public onDraftChange(callback: (event: StorageEvent) => void): () => void {
    this.syncListeners.add(callback)
    return () => this.syncListeners.delete(callback)
  }

  // =============================================================================
  // Private Helper Methods
  // =============================================================================

  private async saveDraftToStorage(draft: EnhancedProjectCreationDraft): Promise<void> {
    const drafts = await this.getAllDrafts()
    const existingIndex = drafts.findIndex(d => d.metadata.id === draft.metadata.id)

    if (existingIndex >= 0) {
      drafts[existingIndex] = draft
    } else {
      drafts.unshift(draft)
    }

    // Limit total drafts
    const limitedDrafts = drafts.slice(0, this.config.maxDrafts)
    await this.saveAllDrafts(limitedDrafts)
  }

  private async saveAllDrafts(drafts: EnhancedProjectCreationDraft[]): Promise<void> {
    try {
      const data = JSON.stringify(drafts)
      localStorage.setItem(this.config.storageKey, data)
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        // Try to free up space by removing oldest drafts
        const reducedDrafts = drafts.slice(0, Math.floor(drafts.length * 0.8))
        localStorage.setItem(this.config.storageKey, JSON.stringify(reducedDrafts))
      } else {
        throw error
      }
    }
  }

  private calculateProgress(
    formData: ProjectFormData,
    navigationState: Pick<NavigationState, 'currentStep' | 'totalSteps'>
  ): number {
    // Simple progress calculation based on filled fields and current step
    let filledFields = 0
    let totalFields = 0

    // Count basics fields
    totalFields += 3 // name, description, type
    if (formData.generalInfo?.name) filledFields++
    if (formData.generalInfo?.description) filledFields++
    if (formData.setupType?.setupType) filledFields++

    // Count database fields
    totalFields += 1 // createNewDatabase or existingDatabase
    if (
      formData.databaseSelection?.createNewDatabase ||
      formData.databaseSelection?.existingDatabase
    ) {
      filledFields++
    }

    // Step progress (current step / total steps * 100)
    const stepProgress = (navigationState.currentStep / navigationState.totalSteps) * 100

    // Field progress (filled fields / total fields * 100)
    const fieldProgress = totalFields > 0 ? (filledFields / totalFields) * 100 : 0

    // Weighted average
    return Math.round((stepProgress * 0.6) + (fieldProgress * 0.4))
  }

  private calculateSize(draft: EnhancedProjectCreationDraft): number {
    return new Blob([JSON.stringify(draft)]).size
  }

  private generateChecksum(data: any): string {
    // Simple checksum generation (in production, use a proper hash function)
    const str = JSON.stringify(data)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(36)
  }

  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj))
  }

  private estimateStorageQuota(): number {
    // Rough estimate of localStorage quota (usually 5-10MB)
    return 5 * 1024 * 1024 // 5MB
  }

  private compress(data: string): string {
    // Placeholder for compression (would use a real compression library)
    return btoa(data)
  }

  private decompress(data: string): string {
    // Placeholder for decompression
    return atob(data)
  }

  private encrypt(data: string): string {
    // Placeholder for encryption (would use a real encryption library)
    return btoa(data)
  }

  private decrypt(data: string): string {
    // Placeholder for decryption
    return atob(data)
  }

  private migrateOldDrafts(): void {
    // Check for old draft format and migrate if necessary
    const oldKey = 'vue-layout-project-creation-drafts'
    const oldData = localStorage.getItem(oldKey)
    
    if (oldData) {
      try {
        const oldDrafts = JSON.parse(oldData)
        // Migration logic would go here
        localStorage.removeItem(oldKey)
      } catch (error) {
        console.warn('Failed to migrate old drafts:', error)
      }
    }
  }
}

// =============================================================================
// Default Export
// =============================================================================

export default DraftManager