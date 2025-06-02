// static/js/admin_global_custom.js

document.addEventListener('DOMContentLoaded', function() {
    
    // ==============================================
    // MEJORAS DE UX GENERALES
    // ==============================================
    
    // Agregar tooltips a los botones
    const buttons = document.querySelectorAll('.button, input[type="submit"], input[type="button"]');
    buttons.forEach(button => {
        if (!button.title && button.value) {
            button.title = `Hacer clic para ${button.value.toLowerCase()}`;
        }
    });
    
    // Confirmación mejorada para eliminar
    const deleteLinks = document.querySelectorAll('.deletelink');
    deleteLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const confirmation = confirm('⚠️ ¿Estás seguro de que quieres eliminar este elemento?\n\nEsta acción no se puede deshacer.');
            if (!confirmation) {
                e.preventDefault();
            }
        });
    });
    
    // ==============================================
    // MEJORAS PARA FORMULARIOS
    // ==============================================
    
    // Auto-resize para textareas
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
        
        // Ajustar altura inicial
        textarea.style.height = textarea.scrollHeight + 'px';
    });
    
    // Contador de caracteres para campos con límite
    const textInputs = document.querySelectorAll('input[maxlength], textarea[maxlength]');
    textInputs.forEach(input => {
        const maxLength = input.getAttribute('maxlength');
        if (maxLength) {
            const counter = document.createElement('small');
            counter.style.color = '#666';
            counter.style.fontSize = '12px';
            counter.style.display = 'block';
            counter.style.marginTop = '5px';
            
            const updateCounter = () => {
                const remaining = maxLength - input.value.length;
                counter.textContent = `${input.value.length}/${maxLength} caracteres`;
                counter.style.color = remaining < 10 ? '#e74c3c' : '#666';
            };
            
            input.addEventListener('input', updateCounter);
            input.parentNode.appendChild(counter);
            updateCounter();
        }
    });
    
    // ==============================================
    // MEJORAS PARA TABLAS
    // ==============================================
    
    // Resaltar filas en hover para mejor legibilidad
    const tableRows = document.querySelectorAll('#result_list tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.01)';
            this.style.zIndex = '10';
        });
        
        row.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.zIndex = 'auto';
        });
    });
    
    // Ordenación visual mejorada
    const sortableHeaders = document.querySelectorAll('#result_list thead th.sortable a');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', function() {
            // Agregar efecto de loading
            const loader = document.createElement('span');
            loader.innerHTML = ' ⏳';
            loader.style.fontSize = '12px';
            this.appendChild(loader);
        });
    });
    
    // ==============================================
    // MEJORAS PARA FILTROS
    // ==============================================
    
    // Collapsar/expandir filtros en dispositivos móviles
    const filterHeader = document.querySelector('#changelist-filter h2');
    if (filterHeader && window.innerWidth <= 768) {
        filterHeader.style.cursor = 'pointer';
        filterHeader.addEventListener('click', function() {
            const filterContent = document.querySelector('#changelist-filter ul');
            if (filterContent) {
                filterContent.style.display = filterContent.style.display === 'none' ? 'block' : 'none';
            }
        });
    }
    
    // ==============================================
    // MEJORAS DE NAVEGACIÓN
    // ==============================================
    
    // Smooth scrolling para enlaces internos
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // ==============================================
    // MEJORAS PARA IMÁGENES
    // ==============================================
    
    // Vista previa mejorada de imágenes
    const imageInputs = document.querySelectorAll('input[type="file"][accept*="image"]');
    imageInputs.forEach(input => {
        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    // Buscar preview existente o crear uno nuevo
                    let preview = input.parentNode.querySelector('.image-preview');
                    if (!preview) {
                        preview = document.createElement('img');
                        preview.className = 'image-preview';
                        preview.style.maxWidth = '200px';
                        preview.style.maxHeight = '200px';
                        preview.style.marginTop = '10px';
                        preview.style.border = '2px solid #ddd';
                        preview.style.borderRadius = '8px';
                        input.parentNode.appendChild(preview);
                    }
                    preview.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    });
    
    // Modal para imágenes existentes
    const existingImages = document.querySelectorAll('img[src]:not(.image-preview)');
    existingImages.forEach(img => {
        if (img.width > 50 || img.height > 50) { // Solo imágenes grandes
            img.style.cursor = 'pointer';
            img.addEventListener('click', function() {
                openImageModal(this.src, this.alt || 'Imagen');
            });
        }
    });
    
    // ==============================================
    // FUNCIONES AUXILIARES
    // ==============================================
    
    function openImageModal(src, alt) {
        // Crear modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            cursor: pointer;
        `;
        
        const img = document.createElement('img');
        img.src = src;
        img.alt = alt;
        img.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        `;
        
        modal.appendChild(img);
        
        // Cerrar al hacer clic
        modal.addEventListener('click', function() {
            document.body.removeChild(modal);
        });
        
        // Cerrar con ESC
        const closeOnEsc = function(e) {
            if (e.key === 'Escape') {
                document.body.removeChild(modal);
                document.removeEventListener('keydown', closeOnEsc);
            }
        };
        document.addEventListener('keydown', closeOnEsc);
        
        document.body.appendChild(modal);
    }
    
    // ==============================================
    // NOTIFICACIONES PERSONALIZADAS
    // ==============================================
    
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `custom-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        // Colores según el tipo
        const colors = {
            'success': '#27ae60',
            'error': '#e74c3c',
            'warning': '#f39c12',
            'info': '#3498db'
        };
        
        notification.style.background = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 5000);
        
        // Permitir cerrar manualmente
        notification.addEventListener('click', function() {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        });
    }
    
    // ==============================================
    // ATAJOS DE TECLADO
    // ==============================================
    
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + S para guardar
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            const saveButton = document.querySelector('input[name="_save"]');
            if (saveButton) {
                saveButton.click();
                showNotification('Guardando...', 'info');
            }
        }
        
        // Ctrl/Cmd + Enter para guardar y continuar editando
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            const saveAndContinueButton = document.querySelector('input[name="_continue"]');
            if (saveAndContinueButton) {
                saveAndContinueButton.click();
                showNotification('Guardando y continuando...', 'info');
            }
        }
    });
    
    // ==============================================
    // INICIALIZACIÓN FINAL
    // ==============================================
    
    console.log('🎨 Django Admin personalizado cargado correctamente');
    
    // Mostrar notificación de bienvenida (solo una vez por sesión)
    if (!sessionStorage.getItem('admin_welcome_shown')) {
        setTimeout(() => {
            showNotification('¡Admin personalizado cargado! Usa Ctrl+S para guardar rápido', 'success');
            sessionStorage.setItem('admin_welcome_shown', 'true');
        }, 1000);
    }
});