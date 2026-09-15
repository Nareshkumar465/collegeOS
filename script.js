const ADMIN_PHONE = '7013839104';
const UPLOAD_PASSWORD = '23465';
const facilityDefaults = [
	['classrooms','🏫','Classrooms','Block A','8 rooms available','HIGH','normal'],['classrooms','🏫','Classrooms','Block B','3 rooms available','HIGH','limited'],['classrooms','🏫','Classrooms','Block C','6 rooms available','MEDIUM','normal'],
	['labs','🔬','Laboratories','Lab C102','Maintenance','HIGH','limited'],['labs','🔬','Laboratories','Lab C103','Available','HIGH','normal'],['labs','🔬','Laboratories','Lab C104','Available','MEDIUM','normal'],
	['halls','🎤','Seminar Halls','Seminar Hall 1','Available - 120 seats','MEDIUM','normal'],['halls','🎤','Seminar Halls','Seminar Hall 2','Booked - 80 seats','MEDIUM','limited'],['auditorium','🎭','Auditorium','Main Auditorium','Available - 500 seats','HIGH','normal'],
	['library','📚','Library','Library','24 seats available / 150 total','HIGH','normal'],['computers','💻','Computer Labs','Computer Lab 1','38 systems available','HIGH','normal'],['computers','💻','Computer Labs','Computer Lab 2','12 systems available','MEDIUM','limited'],
	['sports','🏐','Sports Facilities','Volleyball Court','Available','LOW','normal'],['sports','🏏','Sports Facilities','Cricket Ground','Available','LOW','normal'],['parking','🅿️','Parking','Student Parking','18 spaces available','MEDIUM','limited'],['parking','🅿️','Parking','Staff Parking','12 spaces available','MEDIUM','normal'],
	['water','💧','Drinking-Water Points','Block A Water Point','Working','HIGH','normal'],['water','💧','Drinking-Water Points','Block B Water Point','Maintenance','HIGH','limited'],['restrooms','🚻','Restrooms','Block A Restroom','Operational','HIGH','normal'],['restrooms','🚻','Restrooms','Block B Restroom','Operational','HIGH','normal'],
	['firstaid','🩺','First-Aid Points','Main First-Aid Room','Available','HIGH','normal'],['wifi','📶','Wi-Fi Hotspots','Block A Wi-Fi','Online','HIGH','normal'],['wifi','📶','Wi-Fi Hotspots','Block B Wi-Fi','Slow connection','HIGH','limited'],['wifi','📶','Wi-Fi Hotspots','Library Wi-Fi','Online','MEDIUM','normal']
].map(([group, icon, category, name, value, priority, status], id) => ({ id, group, icon, category, name, value, priority, status, updated: 'Just now' }));
const complaints = [['🧱','Broken Fans','HIGH'],['💡','Lighting Problems','MEDIUM'],['💧','Water Leakage','HIGH'],['📶','Wi-Fi Problems','HIGH'],['🏠','Hostel Problems','MEDIUM'],['🧹','Cleanliness','LOW'],['🪑','Damaged Furniture','MEDIUM'],['⚡','Electrical Problems','HIGH'],['🛣️','Road Problems','HIGH']];
const campusInfrastructureDefaults = [
	{ id: 'classrooms', name: 'Classrooms', icon: '🏫', description: 'Explore classrooms, learning spaces and academic facilities across the campus.', images: [] },
	{ id: 'laboratory', name: 'Laboratory', icon: '🔬', description: 'Explore department laboratories and practical learning facilities.', images: [] },
	{ id: 'seminar-hall', name: 'Seminar Hall', icon: '🎤', description: 'View seminar halls used for workshops, presentations and academic sessions.', images: [] },
	{ id: 'auditorium', name: 'Auditorium', icon: '🎭', description: 'Explore the campus auditorium and major event facilities.', images: [] },
	{ id: 'library', name: 'Library', icon: '📚', description: 'View the central library, reading areas and learning resources.', images: [] },
	{ id: 'computer-labs', name: 'Computer Labs', icon: '💻', description: 'Explore computer laboratories and digital learning facilities.', images: [] },
	{ id: 'sports-facilities', name: 'Sports Facilities', icon: '🏅', description: 'View playgrounds, courts and other sports facilities.', images: [] },
	{ id: 'parking', name: 'Parking', icon: '🅿️', description: 'Explore student, staff and visitor parking areas.', images: [] },
	{ id: 'drinking-water', name: 'Drinking-Water Points', icon: '💧', description: 'Locate drinking-water facilities available across campus.', images: [] },
	{ id: 'restrooms', name: 'Restrooms', icon: '🚻', description: 'View restroom facilities and their campus locations.', images: [] },
	{ id: 'first-aid', name: 'First-Aid Points', icon: '🩺', description: 'Locate first-aid and basic medical support facilities.', images: [] },
	{ id: 'wifi', name: 'Wi-Fi Hotspots', icon: '📶', description: 'View Wi-Fi hotspot locations and campus connectivity areas.', images: [] }
];
const store = { facilities: 'nriFacilities', reports: 'nriComplaints', campus: 'campusInfrastructure' }, read = (key, fallback) => JSON.parse(localStorage.getItem(key) || 'null') || fallback;
let facilities = read(store.facilities, facilityDefaults), reports = read(store.reports, []), imageData = '', campusInfrastructure = read(store.campus, campusInfrastructureDefaults.map((item) => ({ ...item, images: [...item.images] }))), activeInfrastructureId = null, activeUploadMode = 'main', selectedUploadFiles = [];
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value)), statusText = { normal: 'AVAILABLE / NORMAL', limited: 'LIMITED / MAINTENANCE', issue: 'UNAVAILABLE / ISSUE' };

function sanitizeInfrastructureData() {
	campusInfrastructure = campusInfrastructure.map((category) => ({
		...category,
		mainImage: category.mainImage || (category.images || [])[0] || null,
		galleryImages: category.galleryImages || (category.images || []).slice(1),
		images: undefined,
	}));
	campusInfrastructure.forEach((category) => {
		category.mainImage = category.mainImage ? normalizeInfrastructureImageEntry(category.id, category.mainImage, 0) : null;
		category.galleryImages = (category.galleryImages || []).filter((image) => {
			const src = typeof image === 'string' ? image : image?.src;
			return typeof src === 'string' && src.startsWith('data:image/');
		}).map((image) => {
			if (typeof image === 'string') return { id: `${category.id}-stored-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`, src: image, uploaded: true };
			return { id: image.id || `${category.id}-stored-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`, src: image.src, uploaded: Boolean(image.uploaded) || true };
		});
	});
	saveInfrastructureData();
}

sanitizeInfrastructureData();
const infrastructureActionStyles = document.createElement('style');
infrastructureActionStyles.textContent = `
  .gallery-image-item { position: relative; display: flex; flex-direction: column; gap: .7rem; overflow: hidden; border: 1px solid rgba(255,255,255,.16); border-radius: 18px; background: rgba(255,255,255,.04); }
  .gallery-image-item img { display: block; width: 100%; height: 220px; object-fit: cover; }
	.upload-preview-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .6rem; margin: .8rem 0; }
	.upload-preview-list img { width: 100%; height: 100px; object-fit: cover; border-radius: 12px; }
  .campus-placeholder, .detail-empty-image { display: grid; place-items: center; min-height: 220px; border: 1px dashed rgba(255,255,255,.2); border-radius: 18px; background: rgba(255,255,255,.03); color: rgba(255,255,255,.7); font-size: .9rem; text-align: center; }
  .detail-main-image-wrap { width: min(100%, 740px); margin: 0 auto 1rem; }
  .detail-main-image { display: block; width: 100%; max-height: 420px; object-fit: cover; border-radius: 22px; border: 1px solid rgba(255,255,255,.14); background: rgba(255,255,255,.04); }
  .detail-image-actions { display: flex; flex-wrap: wrap; gap: .7rem; margin: 1rem 0 1.2rem; }
	.detail-gallery-heading { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin: 1.4rem 0 .9rem; }
	.detail-gallery-heading h4 { margin: 0; font-size: 1rem; }
  .gallery-image-actions { display: flex; flex-wrap: wrap; gap: .5rem; padding: 0 .85rem .85rem; }
  .gallery-action-btn { border: 1px solid rgba(112,212,223,.45); border-radius: 999px; padding: .55rem .9rem; background: rgba(255,255,255,.04); color: var(--white); font-size: .72rem; font-weight: 700; cursor: pointer; }
  .gallery-action-btn.delete-btn { border-color: rgba(255,164,164,.65); color: #ffd8d8; }
  .delete-image-modal { position: fixed; inset: 0; z-index: 200; display: grid; place-items: center; padding: 1rem; background: rgba(3,14,25,.72); }
  .delete-image-modal.hidden-section { display: none !important; }
  .delete-image-modal-card { width: min(100%, 440px); border: 1px solid rgba(255,255,255,.14); border-radius: 24px; background: linear-gradient(180deg, rgba(8, 29, 44, .96), rgba(7, 18, 30, .96)); box-shadow: 0 12px 40px rgba(0,0,0,.22); padding: 1.4rem; }
  .delete-image-modal-card h3 { margin: 0 0 .6rem; font-size: 1.45rem; }
  .delete-image-modal-card p { margin: 0 0 .9rem; color: rgba(255,255,255,.76); line-height: 1.5; }
  .delete-image-modal-card input { width: 100%; margin-top: .5rem; margin-bottom: .8rem; padding: .75rem .8rem; border: 1px solid rgba(255,255,255,.14); border-radius: 12px; background: rgba(0,20,36,.48); color: var(--white); }
  .delete-confirm-actions { display: flex; justify-content: flex-end; gap: .7rem; margin-top: .8rem; }
  .delete-confirm-actions button { border-radius: 999px; padding: .7rem 1rem; cursor: pointer; }
  .delete-modal-status { min-height: 1.2rem; margin-top: .7rem; color: #9af1b9; font-size: .8rem; }
  .delete-modal-status.error { color: #ffb1b1; }
	@media (max-width: 680px) { .gallery-image-actions { flex-direction: column; } .gallery-action-btn { width: 100%; } .detail-gallery-heading { align-items: stretch; flex-direction: column; } }
`;
document.head.appendChild(infrastructureActionStyles);

function normalizeInfrastructureImageEntry(categoryId, item, itemIndex) {
	if (typeof item === 'string') {
		return { id: `${categoryId}-default-${itemIndex}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`, src: item, uploaded: false };
	}
	if (item && typeof item === 'object' && typeof item.src === 'string') {
		return {
			id: item.id || `${categoryId}-image-${itemIndex}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
			src: item.src,
			uploaded: Boolean(item.uploaded),
		};
	}
	return { id: `${categoryId}-image-${itemIndex}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`, src: '', uploaded: false };
}

function normalizeInfrastructureStorageData() {
	campusInfrastructure = campusInfrastructure.map((category) => ({ ...category, mainImage: category.mainImage ? normalizeInfrastructureImageEntry(category.id, category.mainImage, 0) : null, galleryImages: (category.galleryImages || []).map((image, index) => normalizeInfrastructureImageEntry(category.id, image, index)).filter((image) => image && image.src) }));
	saveInfrastructureData();
}

function getImageFileName(categoryName, imageSrc) {
	const baseName = (categoryName || 'campus-image').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'campus-image';
	const extension = (imageSrc.match(/data:image\/([a-zA-Z0-9.+-]+)/)?.[1] || imageSrc.match(/\.([a-zA-Z0-9]+)(?:\?|$)/)?.[1] || 'png').toLowerCase();
	return `${baseName}-image-${Date.now()}.${extension}`;
}

function getInfrastructureImageById(categoryId, imageId) {
	const category = campusInfrastructure.find((item) => item.id === categoryId);
	if (!category) return null;
	return [category.mainImage, ...(category.galleryImages || [])].find((image) => image?.id === imageId) || null;
}

function renderInfrastructureDetail(categoryId) {
	const detail = document.getElementById('infrastructure-detail');
	const grid = document.getElementById('campus-infrastructure-grid');
	if (!detail || !grid) return;
	const category = campusInfrastructure.find((item) => item.id === categoryId);
	if (!category) return;
	const currentImage = category.mainImage;
	grid.classList.add('hidden-section');
	activeInfrastructureId = categoryId;
	detail.classList.remove('hidden-section');
	detail.innerHTML = `
		<div class="detail-topbar">
			<button class="back-button" type="button" data-back-to-grid>← Back to Campus Infrastructure</button>
		</div>
		<div class="detail-header">
			<h3>${category.name}</h3>
			<p>View available ${category.name.toLowerCase()} images.</p>
		</div>
		<div class="detail-main-image-wrap">
			${currentImage ? `<img class="detail-main-image" src="${currentImage.src}" alt="${category.name} main image">` : `<div class="detail-empty-image">No image uploaded yet</div>`}
		</div>
		<div class="detail-image-actions">
			<button class="gallery-action-btn" type="button" data-upload-category="${category.id}">${currentImage ? 'Change Main Image' : 'Upload Main Image'}</button>
			${currentImage ? `<button class="gallery-action-btn" type="button" data-download-image="${currentImage.id}" data-category-id="${category.id}">Download</button>` : ''}
			${currentImage ? `<button class="gallery-action-btn delete-btn" type="button" data-delete-image="${currentImage.id}" data-category-id="${category.id}">Delete</button>` : ''}
		</div>
		<div class="detail-gallery-heading"><h4>Additional Images</h4><button class="gallery-action-btn" type="button" data-gallery-upload-category="${category.id}">+ Upload More Images</button></div>
		${category.galleryImages.length ? `<div class="detail-gallery">${category.galleryImages.map((image) => `
			<figure class="gallery-image-item">
				<img src="${image.src}" alt="${category.name} image" loading="lazy">
				<div class="gallery-image-actions">
					<button class="gallery-action-btn" type="button" data-download-image="${image.id}" data-category-id="${category.id}">Download</button>
					<button class="gallery-action-btn delete-btn" type="button" data-delete-image="${image.id}" data-category-id="${category.id}">Delete</button>
				</div>
			</figure>
		`).join('')}</div>` : `<div class="detail-empty-image gallery-empty">No additional images uploaded yet</div>`}
	`;
}

function ensureDeleteModal() {
	let deleteModal = document.getElementById('delete-image-modal');
	if (deleteModal) return deleteModal;
	deleteModal = document.createElement('div');
	deleteModal.id = 'delete-image-modal';
	deleteModal.className = 'delete-image-modal hidden-section';
	deleteModal.setAttribute('role', 'dialog');
	deleteModal.setAttribute('aria-modal', 'true');
	deleteModal.innerHTML = `
		<div class="delete-image-modal-card">
			<h3>Delete Image?</h3>
			<p>Are you sure you want to delete this image?</p>
			<label for="delete-password">Admin password</label>
			<input id="delete-password" type="password" inputmode="numeric" autocomplete="off" aria-label="Admin password for image deletion">
			<div class="delete-confirm-actions">
				<button class="button secondary-button" type="button" id="cancel-delete-image">Cancel</button>
				<button class="button" type="button" id="confirm-delete-image">Delete</button>
			</div>
			<p id="delete-password-message" class="delete-modal-status" role="status"></p>
		</div>
	`;
	document.body.appendChild(deleteModal);
	document.getElementById('cancel-delete-image').addEventListener('click', closeDeleteImageModal);
	document.getElementById('confirm-delete-image').addEventListener('click', confirmDeleteInfrastructureImage);
	return deleteModal;
}

let pendingDeleteImage = null;

function openDeleteImageModal(categoryId, imageId) {
	const modal = ensureDeleteModal();
	const category = campusInfrastructure.find((item) => item.id === categoryId);
	const image = getInfrastructureImageById(categoryId, imageId);
	if (!category || !image) {
		showUploadSuccess('Unable to delete the image. Please try again.');
		return;
	}
	pendingDeleteImage = { categoryId, imageId };
	const status = document.getElementById('delete-password-message');
	const passwordField = document.getElementById('delete-password');
	if (status) { status.textContent = ''; status.classList.remove('error'); }
	if (passwordField) passwordField.value = '';
	modal.classList.remove('hidden-section');
}

function closeDeleteImageModal() {
	const modal = document.getElementById('delete-image-modal');
	if (!modal) return;
	modal.classList.add('hidden-section');
	const passwordField = document.getElementById('delete-password');
	const status = document.getElementById('delete-password-message');
	if (passwordField) passwordField.value = '';
	if (status) {
		status.textContent = '';
		status.classList.remove('error');
	}
	pendingDeleteImage = null;
}

function confirmDeleteInfrastructureImage() {
	if (!pendingDeleteImage) return;
	const passwordField = document.getElementById('delete-password');
	const status = document.getElementById('delete-password-message');
	if (!passwordField || !status) return;
	if (passwordField.value !== UPLOAD_PASSWORD) {
		status.textContent = 'Incorrect password. Image deletion denied.';
		status.classList.add('error');
		return;
	}
	const { categoryId, imageId } = pendingDeleteImage;
	const category = campusInfrastructure.find((item) => item.id === categoryId);
	if (!category) {
		status.textContent = 'Unable to delete the image. Please try again.';
		status.classList.add('error');
		return;
	}
	const originalLength = category.galleryImages.length + (category.mainImage ? 1 : 0);
	if (category.mainImage?.id === imageId) category.mainImage = null;
	category.galleryImages = category.galleryImages.filter((image) => image.id !== imageId);
	if (category.galleryImages.length + (category.mainImage ? 1 : 0) === originalLength) {
		status.textContent = 'Unable to delete the image. Please try again.';
		status.classList.add('error');
		return;
	}
	saveInfrastructureData();
	if (activeInfrastructureId === categoryId) {
		renderInfrastructureDetail(categoryId);
	}
	showUploadSuccess('Image deleted successfully.');
	closeDeleteImageModal();
}

function downloadInfrastructureImage(categoryId, imageId) {
	const image = getInfrastructureImageById(categoryId, imageId);
	if (!image) {
		showUploadSuccess('Unable to download this image.');
		return;
	}
	const category = campusInfrastructure.find((item) => item.id === categoryId);
	const fileName = getImageFileName(category ? category.name : 'campus-image', image.src);
	try {
		const link = document.createElement('a');
		link.href = image.src;
		link.download = fileName;
		link.rel = 'noopener';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	} catch (error) {
		showUploadSuccess('Unable to download this image.');
	}
}

function renderFacilities() { const groups = facilities.reduce((all, item) => ((all[item.category] ||= []).push(item), all), {}); document.querySelector('#facility-grid').innerHTML = Object.values(groups).map((items) => { const first = items[0], priority = items.some((item) => item.priority === 'HIGH') ? 'HIGH' : items.some((item) => item.priority === 'MEDIUM') ? 'MEDIUM' : 'LOW'; return `<article class="facility reveal"><div class="facility-top"><span>${first.icon}</span><b class="priority ${priority.toLowerCase()}">${priority} PRIORITY</b></div><h3>${first.category}</h3><div class="facility-list">${items.map((item) => `<div class="facility-row"><strong>${item.name}</strong><span><i class="${item.status}"></i>${item.value}</span><button class="text-button" data-edit="${item.id}" type="button">Edit</button></div>`).join('')}</div></article>`; }).join(''); }
function renderComplaintCategories() { document.querySelector('#complaint-categories').innerHTML = complaints.map(([icon, name, priority]) => `<button class="complaint-category" data-category="${name}" type="button"><span>${icon}</span><strong>${name}</strong><small>${priority} priority</small></button>`).join(''); document.querySelector('#complaint-category').insertAdjacentHTML('beforeend', complaints.map(([, name]) => `<option>${name}</option>`).join('')); }
function renderReports() { const target = document.querySelector('#admin-list'); target.innerHTML = reports.length ? reports.map((r) => `<article class="complaint-record"><strong>${r.id} · ${r.category}</strong><p>📍 ${r.location}</p><p>${r.description}</p>${r.image ? `<img src="${r.image}" alt="Uploaded complaint evidence">` : ''}<p>Submitted: ${new Date(r.time).toLocaleString()} · Priority: ${r.priority}</p><div class="record-actions"><select data-status="${r.id}" aria-label="Change complaint status"><option ${r.status === 'Pending' ? 'selected' : ''}>Pending</option><option ${r.status === 'In Progress' ? 'selected' : ''}>In Progress</option><option ${r.status === 'Resolved' ? 'selected' : ''}>Resolved</option></select><select data-priority="${r.id}" aria-label="Change complaint priority"><option ${r.priority === 'HIGH' ? 'selected' : ''}>HIGH</option><option ${r.priority === 'MEDIUM' ? 'selected' : ''}>MEDIUM</option><option ${r.priority === 'LOW' ? 'selected' : ''}>LOW</option></select></div></article>`).join('') : '<p class="panel-note">No complaints submitted yet.</p>'; }
function editFacility(id) { const item = facilities.find((f) => f.id == id), value = prompt(`Update ${item.name}`, item.value); if (value?.trim()) { item.value = value.trim(); item.updated = 'Just now'; save(store.facilities, facilities); renderFacilities(); } }
function notifyAdministration(complaint) { /* Connect this function to a secure backend/email/SMS service for real administration notifications. */ console.info(`Complaint ${complaint.id} is ready for administration at ${ADMIN_PHONE}.`); }
function complaintId() { const date = new Date().toISOString().slice(0, 10).replaceAll('-', ''); return `CMP-${date}-${String(reports.length + 1).padStart(3, '0')}`; }
function setView(view) {
	const campusSection = document.getElementById('campus-infrastructure-page');
	const exploreSection = document.getElementById('infrastructure');
	if (!campusSection || !exploreSection) return;
	if (view === 'campus') {
		campusSection.classList.remove('hidden-section');
		exploreSection.classList.add('hidden-section');
	} else {
		campusSection.classList.add('hidden-section');
		exploreSection.classList.remove('hidden-section');
	}
	if (document.getElementById('infrastructure-detail')) document.getElementById('infrastructure-detail').classList.add('hidden-section');
	if (document.querySelector('#campus-infrastructure-grid')) document.querySelector('#campus-infrastructure-grid').classList.remove('hidden-section');
	if (view === 'explore') {
		document.querySelector('.site-nav a.active')?.classList.remove('active');
		document.querySelectorAll('.site-nav a')[0]?.classList.add('active');
	}
}
function showMenuView(view) {
	const hero = document.getElementById('home');
	const campusSection = document.getElementById('campus-infrastructure-page');
	const exploreSection = document.getElementById('infrastructure');
	const about = document.getElementById('about');
	const admissions = document.getElementById('admissions');
	const contact = document.getElementById('contact');
	const collegeHeading = document.getElementById('collegeos-heading');
	const facilityGrid = document.getElementById('facility-grid');
	const signalHeading = document.getElementById('signal-heading');
	const signalContent = document.getElementById('signal-content');
	const sections = [hero, campusSection, exploreSection, about, admissions, contact].filter(Boolean);
	sections.forEach((section) => section.classList.add('hidden-section'));
	[collegeHeading, facilityGrid, signalHeading, signalContent].filter(Boolean).forEach((section) => section.classList.remove('hidden-section'));
	if (view === 'home') {
		sections.forEach((section) => section.classList.remove('hidden-section'));
		setView('explore');
		hero.classList.remove('hidden-section');
		window.scrollTo({ top: 0, behavior: 'smooth' });
		return;
	}
	if (view === 'campus') {
		setView('campus');
		window.scrollTo({ top: 0, behavior: 'smooth' });
		return;
	}
	if (view === 'collegeos' || view === 'signal') {
		setView('explore');
		if (view === 'collegeos') {
			signalHeading.classList.add('hidden-section');
			signalContent.classList.add('hidden-section');
		} else {
			collegeHeading.classList.add('hidden-section');
			facilityGrid.classList.add('hidden-section');
		}
		window.scrollTo({ top: 0, behavior: 'smooth' });
		return;
	}
	const destination = { about, admissions, contact }[view];
	if (destination) {
		destination.classList.remove('hidden-section');
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
}
function renderInfrastructureCards() {
	const grid = document.getElementById('campus-infrastructure-grid');
	if (!grid) return;
	grid.innerHTML = campusInfrastructure.map((category) => {
		const currentImage = category.mainImage?.src || '';
		return `
		<article class="campus-card" aria-label="${category.name} infrastructure card">
			<div class="campus-card-image">
				${currentImage ? `<img src="${currentImage}" alt="${category.name} infrastructure" loading="lazy">` : `<div class="campus-placeholder">No image uploaded yet</div>`}
			</div>
			<div class="campus-card-body">
				<h3>${category.name}</h3>
				<p>${category.description}</p>
			</div>
			<div class="campus-card-actions">
				<button class="view-button" type="button" data-open-category="${category.id}">View Photos</button>
				<button class="upload-button" type="button" data-upload-category="${category.id}">${currentImage ? 'Change Main Image' : 'Upload Main Image'}</button>
			</div>
		</article>
	`;
	}).join('');
}
function saveInfrastructureData() {
	save(store.campus, campusInfrastructure);
}
function showUploadSuccess(message) {
	const target = document.getElementById('campus-upload-success');
	if (target) target.textContent = message;
}
function resetUploadModal() {
	const password = document.getElementById('upload-password');
	const fileInput = document.getElementById('upload-file-input');
	const previewList = document.getElementById('upload-preview-list');
	const accessPanel = document.getElementById('upload-access-panel');
	const status = document.getElementById('upload-password-message');
	const fileStatus = document.getElementById('upload-file-message');
	password.value = '';
	fileInput.value = '';
	selectedUploadFiles = [];
	previewList.innerHTML = '';
	previewList.classList.add('hidden-section');
	accessPanel.classList.add('hidden-section');
	status.textContent = '';
	fileStatus.textContent = '';
	status.classList.remove('error');
	fileStatus.classList.remove('error');
}
function openUploadModal(categoryId, mode = 'main') {
	const modal = document.getElementById('upload-modal');
	if (!modal) return;
	activeInfrastructureId = categoryId;
	activeUploadMode = mode;
	modal.classList.remove('hidden-section');
	modal.setAttribute('aria-hidden', 'false');
	resetUploadModal();
}
function closeUploadModal() {
	const modal = document.getElementById('upload-modal');
	if (!modal) return;
	modal.classList.add('hidden-section');
	modal.setAttribute('aria-hidden', 'true');
	resetUploadModal();
}
function verifyUploadPassword() {
	const passwordField = document.getElementById('upload-password');
	const status = document.getElementById('upload-password-message');
	const accessPanel = document.getElementById('upload-access-panel');
	if (!passwordField || !status || !accessPanel) return;
	if (passwordField.value === UPLOAD_PASSWORD) {
		status.textContent = 'Access granted';
		status.classList.remove('error');
		accessPanel.classList.remove('hidden-section');
		return;
	}
	status.textContent = 'Incorrect password. Upload access denied.';
	status.classList.add('error');
	accessPanel.classList.add('hidden-section');
}
function handleUploadSelection(event) {
	const files = [...(event.target.files || [])];
	const previewList = document.getElementById('upload-preview-list');
	const fileStatus = document.getElementById('upload-file-message');
	selectedUploadFiles = [];
	previewList.innerHTML = '';
	if (!files.length || files.some((file) => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type))) {
		fileStatus.textContent = 'Please select valid image files.';
		fileStatus.classList.add('error');
		previewList.classList.add('hidden-section');
		event.target.value = '';
		return;
	}
	selectedUploadFiles = files;
	files.forEach((file) => {
		const preview = document.createElement('img');
		preview.alt = `Selected ${file.name}`;
		preview.src = URL.createObjectURL(file);
		previewList.appendChild(preview);
	});
	previewList.classList.remove('hidden-section');
	fileStatus.textContent = '';
	fileStatus.classList.remove('error');
}
function uploadInfrastructureImage() {
	const fileInput = document.getElementById('upload-file-input');
	const fileStatus = document.getElementById('upload-file-message');
	if (!activeInfrastructureId) return;
	const category = campusInfrastructure.find((item) => item.id === activeInfrastructureId);
	if (!category) return;
	if (!selectedUploadFiles.length || !fileInput.files?.length) {
		fileStatus.textContent = 'Please select valid image files.';
		fileStatus.classList.add('error');
		return;
	}
	if (selectedUploadFiles.some((file) => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type))) {
		fileStatus.textContent = 'Please select valid image files.';
		fileStatus.classList.add('error');
		return;
	}
	Promise.all(selectedUploadFiles.map((file) => new Promise((resolve) => {
		const reader = new FileReader();
		reader.onload = () => resolve({ id: `${category.id}-uploaded-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`, src: reader.result, uploaded: true });
		reader.readAsDataURL(file);
	}))).then((uploadedImages) => {
		if (activeUploadMode === 'main') category.mainImage = uploadedImages[0];
		else category.galleryImages.push(...uploadedImages);
		saveInfrastructureData();
		renderInfrastructureCards();
		if (activeInfrastructureId === category.id) renderInfrastructureDetail(category.id);
		showUploadSuccess(`${uploadedImages.length} image${uploadedImages.length === 1 ? '' : 's'} uploaded successfully to ${category.name}.`);
		closeUploadModal();
	});
}

normalizeInfrastructureStorageData();
renderFacilities(); renderComplaintCategories(); renderReports(); renderInfrastructureCards();
const menuButton = document.querySelector('.menu-toggle'), menu = document.getElementById('site-menu'), menuClose = document.querySelector('.menu-close');
function setMenuOpen(open) {
	menu?.classList.toggle('open', open);
	menu?.setAttribute('aria-hidden', String(!open));
	menuButton?.setAttribute('aria-expanded', String(open));
	menuButton?.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}
menuButton?.addEventListener('click', () => setMenuOpen(!menu?.classList.contains('open')));
menuClose?.addEventListener('click', () => setMenuOpen(false));
document.addEventListener('click', (event) => {
	const menuView = event.target.closest('[data-menu-view]');
	if (menuView) {
		event.preventDefault();
		showMenuView(menuView.dataset.menuView);
		setMenuOpen(false);
		return;
	}
	if (menu?.classList.contains('open') && !menu.contains(event.target) && !menuButton?.contains(event.target)) setMenuOpen(false);
	const edit = event.target.closest('[data-edit]'); if (edit) editFacility(edit.dataset.edit);
	const category = event.target.closest('[data-category]'); if (category) { document.querySelector('#complaint-category').value = category.dataset.category; document.querySelectorAll('.complaint-category').forEach((item) => item.classList.toggle('selected', item === category)); }
	const viewButton = event.target.closest('[data-open-category]'); if (viewButton) renderInfrastructureDetail(viewButton.dataset.openCategory);
	const uploadButton = event.target.closest('[data-upload-category]'); if (uploadButton) openUploadModal(uploadButton.dataset.uploadCategory, 'main');
	const galleryUploadButton = event.target.closest('[data-gallery-upload-category]'); if (galleryUploadButton) openUploadModal(galleryUploadButton.dataset.galleryUploadCategory, 'gallery');
	const downloadButton = event.target.closest('[data-download-image]'); if (downloadButton) downloadInfrastructureImage(downloadButton.dataset.categoryId, downloadButton.dataset.downloadImage);
	const deleteButton = event.target.closest('[data-delete-image]'); if (deleteButton) openDeleteImageModal(deleteButton.dataset.categoryId, deleteButton.dataset.deleteImage);
	const backButton = event.target.closest('[data-back-to-grid]'); if (backButton) { document.getElementById('infrastructure-detail').classList.add('hidden-section'); document.getElementById('campus-infrastructure-grid').classList.remove('hidden-section'); activeInfrastructureId = null; }
	const heroView = event.target.closest('[data-view]'); if (heroView) {
		if (heroView.dataset.view === 'explore') {
			setView('explore');
			document.getElementById('infrastructure')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		} else if (heroView.dataset.view === 'campus') {
			setView('campus');
			document.getElementById('campus-infrastructure-page')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		} else {
			setView(heroView.dataset.view);
		}
	}
});
document.querySelector('#complaint-image').addEventListener('change', ({ target }) => { const file = target.files[0], preview = document.querySelector('#image-preview'); if (!file) return; document.querySelector('#image-name').textContent = file.name; const reader = new FileReader(); reader.onload = () => { imageData = reader.result; preview.src = imageData; preview.style.display = 'block'; }; reader.readAsDataURL(file); });
document.querySelector('#locate').addEventListener('click', () => navigator.geolocation?.getCurrentPosition(({ coords }) => { document.querySelector('#complaint-location').value = `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`; }, () => { document.querySelector('#form-message').textContent = 'Location permission was not available. Enter it manually.'; }));
document.querySelector('#complaint-form').addEventListener('submit', (event) => { event.preventDefault(); const category = document.querySelector('#complaint-category').value, location = document.querySelector('#complaint-location').value.trim(), description = document.querySelector('#complaint-description').value.trim(), message = document.querySelector('#form-message'); if (!category || !imageData || !location || !description) { message.textContent = 'Please complete category, image, location and description.'; return; } const priority = complaints.find(([, name]) => name === category)?.[2] || 'MEDIUM', report = { id: complaintId(), category, image: imageData, location, description, priority, status: 'Pending', time: new Date().toISOString() }; reports.push(report); save(store.reports, reports); notifyAdministration(report); renderReports(); event.target.reset(); imageData = ''; document.querySelector('#image-name').textContent = 'JPG, PNG or WEBP'; document.querySelector('#image-preview').style.display = 'none'; message.textContent = `Complaint submitted successfully: ${report.id}`; });
document.querySelector('#admin-list').addEventListener('change', (event) => { const id = event.target.dataset.status || event.target.dataset.priority, report = reports.find((item) => item.id === id); if (!report) return; if (event.target.dataset.status) report.status = event.target.value; else report.priority = event.target.value; save(store.reports, reports); renderReports(); });
document.querySelector('#reset-data').addEventListener('click', () => { facilities = facilityDefaults.map((item) => ({ ...item })); reports = []; save(store.facilities, facilities); save(store.reports, reports); renderFacilities(); renderReports(); });
document.getElementById('verify-upload-password').addEventListener('click', verifyUploadPassword);
document.getElementById('cancel-upload').addEventListener('click', closeUploadModal);
document.getElementById('upload-file-input').addEventListener('change', handleUploadSelection);
document.getElementById('confirm-upload').addEventListener('click', uploadInfrastructureImage);
document.querySelector('.modal-close').addEventListener('click', closeUploadModal);
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { closeUploadModal(); setMenuOpen(false); } });
setView('explore');
const scrollCue = document.querySelector('.scroll-cue');
scrollCue?.addEventListener('click', (event) => {
	event.preventDefault(); setView('campus'); document.getElementById('campus-infrastructure-page')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
