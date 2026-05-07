// Renderer - Orchestrates rendering of data structures to DOM

import ComponentFactory from './ComponentFactory.js';
import Separator from './Components/Separator.js';

class Renderer {
    constructor() {
        this.factory = new ComponentFactory();
    }

    /**
     * Render a complete page
     */
    renderPage(page, container) {
        if (!page || !container) return;
        
        container.innerHTML = '';
        
        // Render page title
        const title = document.createElement('h1');
        title.className = 'page-title';
        title.textContent = page.fileName.replace('.md', '');
        container.appendChild(title);
        
        // Render top-level content (content not in regions) with section handling
        if (page.content && page.content.length > 0) {
            let inSection = false;
            
            page.content.forEach((contentNode) => {
                const isSectionStarter = contentNode.type === 'text' && 
                                       contentNode.isSectionStarter === true;
                
                // Regions ALWAYS break out of sections - check this FIRST
                // (Note: top-level content shouldn't have regions, but handle it for safety)
                if (contentNode.type === 'region') {
                    // Close any active section before rendering the region
                    if (inSection) {
                        const separator = new Separator('thin', 0);
                        const separatorElement = this.factory.createSeparatorElement(separator);
                        if (separatorElement) {
                            container.appendChild(separatorElement);
                        }
                        inSection = false;
                    }
                    
                    // Render the region independently
                    const regionElement = this.renderRegion(contentNode);
                    if (regionElement) {
                        container.appendChild(regionElement);
                    }
                    return; // Continue to next item
                }
                
                // Handle section starters
                if (isSectionStarter) {
                    // Close previous section if exists
                    if (inSection) {
                        const separator = new Separator('thin', 0);
                        const separatorElement = this.factory.createSeparatorElement(separator);
                        if (separatorElement) {
                            container.appendChild(separatorElement);
                        }
                    }
                    
                    inSection = true;
                    // Render section starter (no indentation)
                    const element = this.renderContentNode(contentNode, null, false);
                    if (element) {
                        container.appendChild(element);
                    }
                } else if (inSection) {
                    // Render content within section with indentation
                    const element = this.renderContentNode(contentNode, null, true);
                    if (element) {
                        container.appendChild(element);
                    }
                } else {
                    // Not in a section, render normally
                    const element = this.renderContentNode(contentNode, null, false);
                    if (element) {
                        container.appendChild(element);
                    }
                }
            });
            
            // Add separator after final section if we ended in a section
            if (inSection) {
                const separator = new Separator('thin', 0);
                const separatorElement = this.factory.createSeparatorElement(separator);
                if (separatorElement) {
                    container.appendChild(separatorElement);
                }
            }
        }
        
        // Render regions
        if (page.regions && page.regions.length > 0) {
            page.regions.forEach(region => {
                const regionElement = this.renderRegion(region);
                if (regionElement) {
                    container.appendChild(regionElement);
                }
            });
        }
    }

    /**
     * Render a region and all its content recursively
     */
    renderRegion(region) {
        if (!region) return null;
        
        const { container, contentContainer } = this.factory.createRegionElement(region);
        
        // Render all content within the region
        if (region.content && region.content.length > 0) {
            let inSection = false;
            
            region.content.forEach((contentNode) => {
                const isSectionStarter = contentNode.type === 'text' && 
                                       contentNode.isSectionStarter === true;
                
                // Handle regions - they always break out of sections
                if (contentNode.type === 'region') {
                    // Close section if active
                    if (inSection) {
                        const separator = new Separator('thin', 0);
                        const separatorElement = this.factory.createSeparatorElement(separator);
                        if (separatorElement) {
                            contentContainer.appendChild(separatorElement);
                        }
                        inSection = false;
                    }
                    // Render region (regions are never in sections)
                    const regionElement = this.renderRegion(contentNode);
                    if (regionElement) {
                        contentContainer.appendChild(regionElement);
                    }
                }
                // Handle section starters
                else if (isSectionStarter) {
                    // Close previous section if exists
                    if (inSection) {
                        const separator = new Separator('thin', 0);
                        const separatorElement = this.factory.createSeparatorElement(separator);
                        if (separatorElement) {
                            contentContainer.appendChild(separatorElement);
                        }
                    }
                    inSection = true;
                    // Render section starter without indentation
                    const element = this.renderContentNode(contentNode, region, false);
                    if (element) {
                        contentContainer.appendChild(element);
                    }
                }
                // Content within a section - render with indentation
                else if (inSection) {
                    const element = this.renderContentNode(contentNode, region, true);
                    if (element) {
                        contentContainer.appendChild(element);
                    }
                }
                // Normal content - render without indentation
                else {
                    const element = this.renderContentNode(contentNode, region, false);
                    if (element) {
                        contentContainer.appendChild(element);
                    }
                }
            });
            
            // Close final section if we ended in one
            if (inSection) {
                const separator = new Separator('thin', 0);
                const separatorElement = this.factory.createSeparatorElement(separator);
                if (separatorElement) {
                    contentContainer.appendChild(separatorElement);
                }
            }
        }
        
        return container;
    }

    /**
     * Render any content node (routes to appropriate factory method)
     */
    renderContentNode(contentNode, parentRegion = null, inSection = false) {
        if (!contentNode) return null;
        
        switch (contentNode.type) {
            case 'region':
                return this.renderRegion(contentNode);
            case 'text':
                return this.factory.createTextBlockElement(contentNode, parentRegion, inSection);
            case 'table':
                return this.factory.createTableElement(contentNode, inSection);
            case 'separator':
                return this.factory.createSeparatorElement(contentNode);
            case 'link':
                return this.factory.createLinkElement(contentNode);
            case 'image':
                return this.factory.createImageElement(contentNode);
            default:
                console.warn('Unknown content node type:', contentNode.type);
                return null;
        }
    }
}

export default Renderer;

