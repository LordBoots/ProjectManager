// Main entry point for the Viewer.

// required major components:
// - Application class - responsible for the overall application startup, shutdown, and main loop.
// - markdown parser class - responsible for parsing the markdown files into a data structure
// - data structure class - responsible for storing the data structure
// - Data Store of some sort - responsible for live data storage and retrieval. Works on datastructures to ensure consistency and data integrity.
// - rendering engine class - responsible for rendering the data structure
// - Component Factory class - Factory for creating components
// - Component class - Base of all visual elements

// required minor components:
// UI:
// - sidebar with inbuilt navigation index
// - top navigation bar
// - main content area
// - footer with links to the previous and next pages
// - Slide out Right Sidebar to act as a non intrusive "extras" panel - would be used to display tables and such that exist outside of the main content area.

import Parser from './Parser.js';
import Renderer from './Renderer.js';

class Application {
    constructor() {
        this.document = null; // Instance of Document object
        this.parser = null; // Instance of Parser object
        this.renderer = null; // Instance of Renderer object (will be added later)
        
        // Application state
        this.currentPageIndex = 0; // Index of currently displayed page
        this.currentPage = null; // Currently displayed Page object
        
        // Navigation history
        this.history = []; // Array of page indices representing navigation history
        this.historyIndex = -1; // Current position in history (-1 means no history)
        
        // DOM element references
        this.sidebar = null;
        this.contentArea = null;
        this.extrasPanel = null;
        this.navBackButton = null;
        this.navForwardButton = null;
        this.currentPageDisplay = null;
        
        // UI state
        this.extrasPanelOpen = false;
    }

    /**
     * Initialize the application
     * This is the main entry point called when the app starts
     */
    async initialize() {
        try {
            console.log('Initializing GDD Viewer...');
            
            // Get DOM references
            this.sidebar = document.getElementById('sidebar');
            this.contentArea = document.getElementById('content-area');
            this.extrasPanel = document.getElementById('extras-panel');
            this.navBackButton = document.getElementById('nav-back');
            this.navForwardButton = document.getElementById('nav-forward');
            this.currentPageDisplay = document.getElementById('current-page');
            
            if (!this.sidebar || !this.contentArea || !this.extrasPanel || 
                !this.navBackButton || !this.navForwardButton || !this.currentPageDisplay) {
                throw new Error('Required DOM elements not found');
            }
            
            // Set up navigation button handlers
            this.navBackButton.addEventListener('click', () => this.navigateBack());
            this.navForwardButton.addEventListener('click', () => this.navigateForward());
            
            // Initialize parser
            this.parser = new Parser();
            
            // Initialize renderer
            this.renderer = new Renderer();
            
            // Parse all markdown files
            console.log('Parsing markdown files...');
            this.document = await this.parser.parseAllFiles();
            
            if (!this.document || !this.document.pages || this.document.pages.length === 0) {
                throw new Error('No pages were parsed');
            }
            
            console.log(`Successfully parsed ${this.document.pages.length} page(s)`);
            console.log('Document structure:', this.document);
            
            // Set initial page (first page or Overview if it exists)
            const overviewIndex = this.document.pages.findIndex(page => 
                page.fileName === 'Overview.md' || page.fileName === 'overview.md'
            );
            this.currentPageIndex = overviewIndex >= 0 ? overviewIndex : 0;
            this.currentPage = this.document.pages[this.currentPageIndex];
            
            // Initialize history with the initial page
            this.history = [this.currentPageIndex];
            this.historyIndex = 0;
            
            // Build sidebar navigation
            this.buildSidebarNavigation();
            
            // Render initial page
            this.renderCurrentPage();
            
            // Update navigation UI
            this.updateNavigationUI();
            
            // Listen for file navigation events (from links)
            window.addEventListener('navigateToFile', (e) => {
                const filePath = e.detail.filePath;
                // Extract filename from path
                const fileName = filePath.split('/').pop() || filePath.split('\\').pop();
                this.navigateToPageByName(fileName);
            });
            
            console.log('Application initialized successfully');
            
        } catch (error) {
            console.error('Error initializing application:', error);
            this.showError('Failed to initialize application: ' + error.message);
        }
    }

    /**
     * Build the sidebar navigation from the document structure
     */
    buildSidebarNavigation() {
        if (!this.sidebar || !this.document) return;
        
        this.sidebar.innerHTML = '';
        
        // Create navigation header
        const header = document.createElement('div');
        header.style.cssText = 'padding: 15px; font-weight: bold; font-size: 18px; border-bottom: 1px solid #404040;';
        header.textContent = 'Navigation';
        this.sidebar.appendChild(header);
        
        // Create page list
        const pageList = document.createElement('ul');
        pageList.style.cssText = 'list-style: none; padding: 0; margin: 0;';
        
        // Sort pages so Overview always appears first
        const sortedPages = [...this.document.pages].sort((a, b) => {
            const aIsOverview = a.fileName.toLowerCase() === 'overview.md';
            const bIsOverview = b.fileName.toLowerCase() === 'overview.md';
            
            if (aIsOverview && !bIsOverview) return -1;
            if (!aIsOverview && bIsOverview) return 1;
            return 0; // Keep original order for non-Overview pages
        });
        
        sortedPages.forEach((page) => {
            // Find the original index for navigation
            const originalIndex = this.document.pages.findIndex(p => p === page);
            
            const listItem = document.createElement('li');
            listItem.style.cssText = 'padding: 8px 15px; cursor: pointer; border-bottom: 1px solid #404040;';
            
            // Make Overview blue
            const isOverview = page.fileName.toLowerCase() === 'overview.md';
            if (isOverview) {
                listItem.style.color = '#4a9eff';
            }
            
            if (originalIndex === this.currentPageIndex) {
                listItem.style.backgroundColor = '#404040';
                listItem.style.fontWeight = 'bold';
            }
            
            // Convert camelCase to readable format (e.g., "EquipmentManagement" -> "Equipment Management")
            let displayName = page.fileName.replace('.md', '');
            displayName = displayName.replace(/([a-z])([A-Z])/g, '$1 $2');
            listItem.textContent = displayName;
            listItem.addEventListener('click', () => this.navigateToPage(originalIndex));
            
            // Hover effect
            listItem.addEventListener('mouseenter', () => {
                if (originalIndex !== this.currentPageIndex) {
                    listItem.style.backgroundColor = '#353535';
                }
            });
            listItem.addEventListener('mouseleave', () => {
                if (originalIndex !== this.currentPageIndex) {
                    listItem.style.backgroundColor = 'transparent';
                }
            });
            
            pageList.appendChild(listItem);
        });
        
        this.sidebar.appendChild(pageList);
        
        // Build page index if current page has one
        if (this.currentPage && this.currentPage.pageIndex && this.currentPage.pageIndex.length > 0) {
            this.buildPageIndex();
        }
    }

    /**
     * Build the page index (table of contents) for the current page
     */
    buildPageIndex() {
        if (!this.sidebar || !this.currentPage || !this.currentPage.pageIndex) return;
        
        // Remove existing index if any
        const existingIndex = this.sidebar.querySelector('.page-index');
        if (existingIndex) {
            existingIndex.remove();
        }
        
        // Create index container
        const indexContainer = document.createElement('div');
        indexContainer.className = 'page-index';
        indexContainer.style.cssText = 'padding: 15px; border-top: 1px solid #404040; margin-top: 10px;';
        
        const indexHeader = document.createElement('div');
        indexHeader.style.cssText = 'font-weight: bold; margin-bottom: 10px; font-size: 14px; color: #4a9eff;';
        indexHeader.textContent = 'Page Index';
        indexContainer.appendChild(indexHeader);
        
        // Create index list
        const indexList = document.createElement('ul');
        indexList.style.cssText = 'list-style: none; padding: 0; margin: 0;';
        
        // Determine which entries have children (entries at higher levels below them)
        const entries = this.currentPage.pageIndex;
        entries.forEach((entry, index) => {
            // Check if this entry has children (next entry at higher level)
            const hasChildren = index < entries.length - 1 && 
                                entries[index + 1].level > entry.level;
            
            entry.hasChildren = hasChildren;
        });
        
        // Build the index with grouping
        let i = 0;
        while (i < entries.length) {
            const entry = entries[i];
            
            if (entry.hasChildren) {
                // This entry has children - create a group
                const groupContainer = document.createElement('div');
                groupContainer.className = 'index-group';
                groupContainer.style.cssText = 'border: 1px solid #404040; border-radius: 4px; margin: 5px 0; padding: 5px;';
                
                // Add the parent entry
                const parentItem = this.createIndexItem(entry);
                parentItem.style.cssText += 'font-weight: bold; margin-bottom: 3px;';
                groupContainer.appendChild(parentItem);
                
                // Add children until we hit same or lower level
                i++;
                const childrenList = document.createElement('ul');
                childrenList.style.cssText = 'list-style: none; padding: 0; margin: 0; margin-left: 10px;';
                
                while (i < entries.length && entries[i].level > entry.level) {
                    const childItem = this.createIndexItem(entries[i]);
                    childrenList.appendChild(childItem);
                    i++;
                }
                
                if (childrenList.children.length > 0) {
                    groupContainer.appendChild(childrenList);
                }
                
                indexList.appendChild(groupContainer);
            } else {
                // Standalone entry - frame it individually
                const standaloneContainer = document.createElement('div');
                standaloneContainer.className = 'index-standalone';
                standaloneContainer.style.cssText = 'border: 1px solid #404040; border-radius: 4px; margin: 5px 0; padding: 5px;';
                
                const item = this.createIndexItem(entry);
                standaloneContainer.appendChild(item);
                indexList.appendChild(standaloneContainer);
                i++;
            }
        }
        
        indexContainer.appendChild(indexList);
        this.sidebar.appendChild(indexContainer);
    }

    /**
     * Create an index item element
     */
    createIndexItem(entry) {
        const listItem = document.createElement('li');
        const paddingLeft = (entry.level - 1) * 10;
        listItem.style.cssText = `padding: 5px 0 5px ${paddingLeft}px; cursor: pointer; font-size: 13px; color: #e0e0e0;`;
        // Strip trailing colon from title
        const displayTitle = entry.title.replace(/:$/, '');
        listItem.textContent = displayTitle;
        
        // Click to scroll to anchor
        listItem.addEventListener('click', () => {
            this.scrollToAnchor(entry.anchor);
        });
        
        // Hover effect
        listItem.addEventListener('mouseenter', () => {
            listItem.style.color = '#4a9eff';
        });
        listItem.addEventListener('mouseleave', () => {
            listItem.style.color = '#e0e0e0';
        });
        
        return listItem;
    }

    /**
     * Navigate to a specific page by index
     * @param {number} pageIndex - The index of the page to navigate to
     * @param {boolean} addToHistory - Whether to add this navigation to history (default: true)
     */
    navigateToPage(pageIndex, addToHistory = true) {
        if (!this.document || !this.document.pages || pageIndex < 0 || pageIndex >= this.document.pages.length) {
            console.error('Invalid page index:', pageIndex);
            return;
        }
        
        // Don't navigate if it's the same page
        if (pageIndex === this.currentPageIndex) {
            return;
        }
        
        this.currentPageIndex = pageIndex;
        this.currentPage = this.document.pages[pageIndex];
        
        // Add to history if requested
        if (addToHistory) {
            // Remove any forward history if we're not at the end
            if (this.historyIndex < this.history.length - 1) {
                this.history = this.history.slice(0, this.historyIndex + 1);
            }
            // Add new page to history
            this.history.push(pageIndex);
            this.historyIndex = this.history.length - 1;
        }
        
        // Rebuild sidebar to update active state
        this.buildSidebarNavigation();
        
        // Render the new page
        this.renderCurrentPage();
        
        // Scroll to top
        this.contentArea.scrollTop = 0;
        
        // Update navigation UI
        this.updateNavigationUI();
    }

    /**
     * Navigate to a page by filename
     */
    navigateToPageByName(fileName) {
        const pageIndex = this.document.pages.findIndex(page => 
            page.fileName.toLowerCase() === fileName.toLowerCase() ||
            page.fileName.toLowerCase() === fileName.toLowerCase() + '.md'
        );
        
        if (pageIndex >= 0) {
            this.navigateToPage(pageIndex);
        } else {
            console.error('Page not found:', fileName);
        }
    }

    /**
     * Render the current page using the renderer
     */
    renderCurrentPage() {
        if (!this.contentArea || !this.currentPage || !this.renderer) return;
        
        // Use renderer to render the page
        this.renderer.renderPage(this.currentPage, this.contentArea);
        
        console.log('Page rendered:', this.currentPage.fileName);
    }

    /**
     * Scroll to an anchor on the current page
     */
    scrollToAnchor(anchor) {
        // Remove # if present for getElementById
        const anchorId = anchor.startsWith('#') ? anchor.substring(1) : anchor;
        const element = document.getElementById(anchorId);
        
        if (element) {
            // Calculate the position relative to the content area
            const contentAreaRect = this.contentArea.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            const relativeTop = elementRect.top - contentAreaRect.top + this.contentArea.scrollTop;
            
            // Scroll the content area to show the element
            this.contentArea.scrollTo({
                top: relativeTop - 20, // 20px offset from top
                behavior: 'smooth'
            });
            
            // Also highlight the element briefly
            element.style.transition = 'background-color 0.3s';
            const originalBg = element.style.backgroundColor;
            element.style.backgroundColor = 'rgba(74, 158, 255, 0.2)';
            setTimeout(() => {
                element.style.backgroundColor = originalBg;
            }, 1000);
        } else {
            console.warn('Anchor not found:', anchor, 'Looking for ID:', anchorId);
        }
    }

    /**
     * Toggle the extras panel
     */
    toggleExtrasPanel() {
        this.extrasPanelOpen = !this.extrasPanelOpen;
        if (this.extrasPanelOpen) {
            this.extrasPanel.classList.add('open');
        } else {
            this.extrasPanel.classList.remove('open');
        }
    }

    /**
     * Show an error message to the user
     */
    showError(message) {
        if (this.contentArea) {
            this.contentArea.innerHTML = `
                <div style="padding: 20px; color: #ff6b6b; background-color: #2d2d2d; border-radius: 5px; margin: 20px;">
                    <h2 style="margin-bottom: 10px;">Error</h2>
                    <p>${message}</p>
                </div>
            `;
        }
    }

    /**
     * Get the current page
     */
    getCurrentPage() {
        return this.currentPage;
    }

    /**
     * Get the document
     */
    getDocument() {
        return this.document;
    }

    /**
     * Navigate back in history
     */
    navigateBack() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const pageIndex = this.history[this.historyIndex];
            // Navigate without adding to history (we're using existing history)
            this.navigateToPage(pageIndex, false);
        }
    }

    /**
     * Navigate forward in history
     */
    navigateForward() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const pageIndex = this.history[this.historyIndex];
            // Navigate without adding to history (we're using existing history)
            this.navigateToPage(pageIndex, false);
        }
    }

    /**
     * Update the navigation UI (back/forward buttons and current page display)
     */
    updateNavigationUI() {
        if (!this.navBackButton || !this.navForwardButton || !this.currentPageDisplay) {
            return;
        }
        
        // Update back button state
        this.navBackButton.disabled = this.historyIndex <= 0;
        
        // Update forward button state
        this.navForwardButton.disabled = this.historyIndex >= this.history.length - 1;
        
        // Update current page display
        if (this.currentPage) {
            let displayName = this.currentPage.fileName.replace('.md', '');
            displayName = displayName.replace(/([a-z])([A-Z])/g, '$1 $2');
            this.currentPageDisplay.textContent = displayName;
        } else {
            this.currentPageDisplay.textContent = '';
        }
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new Application();
    app.initialize();
});

export default Application;