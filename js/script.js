// Lấy đường dẫn của file script hiện tại để xác định đúng vị trí data.json.
// Ví dụ: ./js/script.js -> ./js/data.json
const currentScriptUrl = document.currentScript?.src;
const projectDataUrl = currentScriptUrl
    ? new URL('./data.json', currentScriptUrl).href
    : new URL('./js/data.json', window.location.href).href;

document.addEventListener('DOMContentLoaded', () => {
    // Hàm chuyển dữ liệu thành chuỗi an toàn trước khi đưa vào innerHTML.
    const escapeHTML = (value) => {
        return String(value ?? '').replace(/[&<>"']/g, (character) => {
            const entities = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            };

            return entities[character];
        });
    };

    // ==========================================
    // PHẦN 4.3: LOCALSTORAGE & DARK MODE
    // ==========================================

    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;

    let savedTheme = null;

    // Đọc giao diện đã lưu. Một số môi trường có thể chặn LocalStorage.
    try {
        savedTheme = localStorage.getItem('theme');
    } catch (error) {
        console.warn('Không thể đọc LocalStorage:', error);
    }

    // Chỉ nhận hai giá trị hợp lệ: dark hoặc light.
    const systemPrefersDark = window.matchMedia
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : false;

    const initialTheme = ['dark', 'light'].includes(savedTheme)
        ? savedTheme
        : (systemPrefersDark ? 'dark' : 'light');

    body.classList.toggle('dark-mode', initialTheme === 'dark');

    const updateThemeButton = () => {
        if (!themeToggleBtn) return;

        const isDarkMode = body.classList.contains('dark-mode');

        themeToggleBtn.textContent = isDarkMode ? 'Light' : 'Dark';
        themeToggleBtn.setAttribute(
            'aria-label',
            isDarkMode ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'
        );
        themeToggleBtn.setAttribute('aria-pressed', String(isDarkMode));
    };

    updateThemeButton();

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            body.classList.toggle('dark-mode');

            const selectedTheme = body.classList.contains('dark-mode')
                ? 'dark'
                : 'light';

            try {
                localStorage.setItem('theme', selectedTheme);
            } catch (error) {
                console.warn('Không thể lưu giao diện:', error);
            }

            updateThemeButton();
        });
    }

    // ==========================================
    // PHẦN 3.1 & 3.2: DỮ LIỆU TĨNH, MAP/FILTER
    // ==========================================

    const skillsData = [
        {
            name: 'Lập trình web',
            desc: 'HTML, CSS, JavaScript, React.',
            level: 90,
            active: true
        },
        {
            name: 'Mobile App',
            desc: 'Flutter và React Native đa nền tảng.',
            level: 80,
            active: true
        },
        {
            name: 'Trí tuệ nhân tạo',
            desc: 'Finetuning, RAG, Ontology.',
            level: 75,
            active: true
        },
        {
            name: 'Kỹ năng cũ',
            desc: 'Công nghệ đã lỗi thời.',
            level: 40,
            active: false
        }
    ];

    const skillContainer = document.getElementById('skill-list');

    const renderSkills = () => {
        if (!skillContainer) {
            console.warn('Không tìm thấy phần tử #skill-list trong HTML.');
            return;
        }

        // Lọc những kỹ năng đang được bật.
        const activeSkills = skillsData.filter(skill => skill.active === true);

        // Chuyển danh sách kỹ năng thành HTML.
        const skillsHTML = activeSkills.map(skill => `
            <div class="skill-item">
                <h3 class="skill-name">${escapeHTML(skill.name)} (${escapeHTML(skill.level)}%)</h3>
                <p class="skill-description">${escapeHTML(skill.desc)}</p>
            </div>
        `).join('');

        skillContainer.innerHTML = skillsHTML;
    };

    renderSkills();

    // ==========================================
    // PHẦN 4.1, 4.2 & 4.4: FETCH API, ASYNC/AWAIT
    // ==========================================

    const projectContainer = document.getElementById('project-list');

    const fetchProjects = async () => {
        if (!projectContainer) {
            console.warn('Không tìm thấy phần tử #project-list trong HTML.');
            return;
        }

        // Thông báo trạng thái trong lúc tải dữ liệu.
        projectContainer.innerHTML = '<p class="loading-message">Đang tải dự án...</p>';

        try {
            // Đường dẫn được tính từ vị trí thật của script.js.
            const response = await fetch(projectDataUrl, {
                headers: { Accept: 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`Không tải được data.json (HTTP ${response.status}).`);
            }

            const data = await response.json();

            // Chấp nhận cả dạng mảng trực tiếp và dạng object có thuộc tính projects.
            const projects = Array.isArray(data)
                ? data
                : (Array.isArray(data.projects) ? data.projects : null);

            if (!projects) {
                throw new Error(
                    'Cấu trúc data.json không hợp lệ. Hãy dùng một mảng dự án hoặc object có thuộc tính "projects".'
                );
            }

            if (projects.length === 0) {
                projectContainer.innerHTML = '<p class="empty-message">Chưa có dự án nào.</p>';
                return;
            }

            // Dùng map để tạo từng thẻ dự án từ dữ liệu JSON.
            const projectsHTML = projects.map((project) => {
                if (!project || typeof project !== 'object' || Array.isArray(project)) {
                    return '';
                }

                // Hỗ trợ tên thuộc tính tiếng Việt và một số tên tiếng Anh phổ biến.
                const projectName = project.ten ?? project.name ?? project.title ?? 'Dự án chưa đặt tên';
                const technologies = project.congNghe ?? project.technologies ?? project.technology ?? 'Chưa cập nhật';
                const completionYear = project.namHoanThanh ?? project.year ?? 'Chưa cập nhật';
                const description = project.moTa ?? project.description ?? '';

                const technologyText = Array.isArray(technologies)
                    ? technologies.join(', ')
                    : technologies;

                return `
                    <article class="project-item">
                        <h3 class="project-name">${escapeHTML(projectName)}</h3>
                        ${description ? `
                            <p class="project-description">${escapeHTML(description)}</p>
                        ` : ''}
                        <p class="project-description">
                            <strong>Công nghệ:</strong> ${escapeHTML(technologyText)}
                        </p>
                        <p class="project-description">
                            <strong>Năm:</strong> ${escapeHTML(completionYear)}
                        </p>
                    </article>
                `;
            }).join('');

            projectContainer.innerHTML = projectsHTML ||
                '<p class="empty-message">Không có dữ liệu dự án hợp lệ.</p>';

        } catch (error) {
            console.error('Lỗi tải dữ liệu dự án:', error);

            projectContainer.innerHTML = `
                <p class="error-message">
                    Không thể tải danh sách dự án. ${escapeHTML(error.message)}
                    <br>Kiểm tra vị trí file js/data.json và định dạng JSON.
                </p>
            `;
        }
    };

    fetchProjects();

    // ==========================================
    // PHẦN 3.3: XỬ LÝ FORM & VALIDATE BẰNG JS
    // ==========================================

    const contactForm = document.querySelector('.contact-form');

    if (contactForm) {
        let formMessage = document.getElementById('form-message');

        // Nếu HTML chưa có vùng thông báo thì tạo tự động.
        if (!formMessage) {
            formMessage = document.createElement('p');
            formMessage.id = 'form-message';
            formMessage.className = 'form-message';
            formMessage.setAttribute('role', 'status');
            formMessage.setAttribute('aria-live', 'polite');

            const submitButton = contactForm.querySelector('button[type="submit"]');

            if (submitButton) {
                contactForm.insertBefore(formMessage, submitButton);
            } else {
                contactForm.appendChild(formMessage);
            }
        }

        contactForm.addEventListener('submit', (event) => {
            // Ngăn trình duyệt tải lại trang.
            event.preventDefault();

            const nameElement = document.getElementById('name');
            const emailElement = document.getElementById('email');
            const messageElement = document.getElementById('message');

            if (!nameElement || !emailElement || !messageElement) {
                console.error('Form cần có các phần tử #name, #email và #message.');
                formMessage.textContent = 'Form HTML đang thiếu trường thông tin.';
                formMessage.dataset.status = 'error';
                return;
            }

            const nameInput = nameElement.value.trim();
            const emailInput = emailElement.value.trim();
            const messageInput = messageElement.value.trim();

            if (nameInput.length < 2) {
                formMessage.textContent = 'Tên phải chứa ít nhất 2 ký tự!';
                formMessage.dataset.status = 'error';
                return;
            }

            // Kiểm tra email cơ bản; input type="email" vẫn được trình duyệt kiểm tra thêm.
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(emailInput)) {
                formMessage.textContent = 'Vui lòng nhập địa chỉ email hợp lệ!';
                formMessage.dataset.status = 'error';
                return;
            }

            if (messageInput.length < 10) {
                formMessage.textContent = 'Tin nhắn quá ngắn, vui lòng nhập ít nhất 10 ký tự!';
                formMessage.dataset.status = 'error';
                return;
            }

            // Đây là thông báo mô phỏng; form chưa gửi dữ liệu lên máy chủ.
            formMessage.textContent = `Cảm ơn ${nameInput}! Phần kiểm tra thông tin đã hoàn tất.`;
            formMessage.dataset.status = 'success';

            contactForm.reset();
        });
    }
});
