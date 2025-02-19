import { getCurrentUser, showSuccess, showError, showWarning } from './utils.js';

class WeekendTracker {
    static initialize() {
        this.initializeEventListeners();
        this.loadEntries();
        this.currentEditingEntry = null; // Add this line to track editing state
    }

    static initializeEventListeners() {
        const addButton = document.getElementById('add-weekend-entry');
        const modal = document.getElementById('weekend-modal');
        const closeButtons = modal.querySelectorAll('.close-modal');
        const form = document.getElementById('weekend-form');
        const compOffEarned = document.getElementById('comp-off-earned');
        const compOffDateGroup = document.getElementById('comp-off-date-group');
        const modalTitle = modal.querySelector('.modal-header h2');

        // Add Entry button
        addButton.addEventListener('click', () => {
            this.currentEditingEntry = null;
            modalTitle.textContent = 'Add Weekend Working Entry';
            form.reset();
            modal.classList.add('active');
        });

        // Close modal
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                modal.classList.remove('active');
                form.reset();
                this.currentEditingEntry = null;
            });
        });

        // Form submission
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Comp off date visibility
        if (compOffEarned) {
            compOffEarned.addEventListener('change', (e) => {
                compOffDateGroup.style.display = e.target.value === 'yes' ? 'block' : 'none';
            });
        }

        // Set min date to current date for weekend date
        const weekendDate = document.getElementById('weekend-date');
        if (weekendDate) {
            weekendDate.max = new Date().toISOString().split('T')[0];
        }
    }

    static loadEntries() {
        const entriesList = document.getElementById('weekend-entries');
        if (!entriesList) return;

        const entries = this.getEntries();

        if (entries.length === 0) {
            entriesList.innerHTML = '<p class="no-entries">No weekend working entries found</p>';
            return;
        }

        // Sort entries by date (oldest first)
        const sortedEntries = entries.sort((a, b) => new Date(a.weekendDate) - new Date(b.weekendDate));
        entriesList.innerHTML = this.createEntryCard(sortedEntries);
    }

    static createEntryCard(entries) {
        return `
            <table class="weekend-table">
                <thead>
                    <tr>
                        <th>Weekend Date</th>
                        <th>Comp Off Earned</th>
                        <th>Comp Off Availed</th>
                        <th>Expense Claimed</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${entries.map(entry => `
                        <tr>
                            <td>${new Date(entry.weekendDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}</td>
                            <td class="status ${entry.compOffEarned}">${entry.compOffEarned}</td>
                            <td>${entry.compOffDate ? new Date(entry.compOffDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : 'Not Applicable'}</td>
                            <td class="status ${entry.expenseClaimed}">${entry.expenseClaimed}</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="edit-button" onclick="WeekendTracker.editEntry('${entry.weekendDate}')" title="Edit Entry">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="delete-button" onclick="WeekendTracker.deleteEntry('${entry.weekendDate}')" title="Delete Entry">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    static async handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const modal = document.getElementById('weekend-modal');
        const weekendDate = form.querySelector('#weekend-date').value;
        const currentUser = getCurrentUser();

        // Check for duplicate date only when adding new entry
        if (!this.currentEditingEntry) {
            const existingEntries = JSON.parse(localStorage.getItem('weekendEntries') || '[]');
            const hasDuplicate = existingEntries.some(entry =>
                entry.userId === currentUser.psId &&
                entry.weekendDate === weekendDate
            );

            if (hasDuplicate) {
                await showError('Error', 'An entry for this date already exists. Please choose a different date.');
                return;
            }
        }

        const entry = {
            weekendDate,
            compOffEarned: form.querySelector('#comp-off-earned').value,
            compOffDate: form.querySelector('#comp-off-date').value || null,
            expenseClaimed: form.querySelector('#expense-claimed').value,
            userId: currentUser.psId,
            createdAt: this.currentEditingEntry ? this.currentEditingEntry.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        try {
            if (this.currentEditingEntry) {
                this.updateEntry(entry);
                await showSuccess('Success', 'Weekend working entry updated successfully');
            } else {
                this.saveEntry(entry);
                await showSuccess('Success', 'Weekend working entry added successfully');
            }

            modal.classList.remove('active');
            form.reset();
            this.currentEditingEntry = null;
            this.loadEntries();
        } catch (error) {
            await showError('Error', error.message);
        }
    }

    static async editEntry(weekendDate) {
        const entries = JSON.parse(localStorage.getItem('weekendEntries') || '[]');
        const currentUser = getCurrentUser();
        const entry = entries.find(e => e.userId === currentUser.psId && e.weekendDate === weekendDate);

        if (!entry) {
            await showError('Error', 'Entry not found');
            return;
        }

        this.currentEditingEntry = entry;

        // Populate the form with existing data
        const form = document.getElementById('weekend-form');
        const modal = document.getElementById('weekend-modal');
        const modalTitle = modal.querySelector('.modal-header h2');

        modalTitle.textContent = 'Edit Weekend Working Entry';
        form.querySelector('#weekend-date').value = entry.weekendDate;
        form.querySelector('#comp-off-earned').value = entry.compOffEarned;
        form.querySelector('#comp-off-date').value = entry.compOffDate || '';
        form.querySelector('#expense-claimed').value = entry.expenseClaimed;

        // Show/hide comp off date based on comp off earned value
        const compOffDateGroup = document.getElementById('comp-off-date-group');
        compOffDateGroup.style.display = entry.compOffEarned === 'yes' ? 'block' : 'none';

        modal.classList.add('active');
    }

    static updateEntry(updatedEntry) {
        const entries = JSON.parse(localStorage.getItem('weekendEntries') || '[]');
        const currentUser = getCurrentUser();

        const index = entries.findIndex(entry =>
            entry.userId === currentUser.psId &&
            entry.weekendDate === this.currentEditingEntry.weekendDate
        );

        if (index !== -1) {
            entries[index] = updatedEntry;
            localStorage.setItem('weekendEntries', JSON.stringify(entries));
        }
    }

    static async deleteEntry(weekendDate) {
        const confirmed = await showWarning(
            'Delete Entry',
            'Are you sure you want to delete this weekend working entry? This action cannot be undone.',
            true
        );

        if (confirmed) {
            try {
                const entries = JSON.parse(localStorage.getItem('weekendEntries') || '[]');
                const currentUser = getCurrentUser();

                // Filter out all entries matching the date for current user
                const updatedEntries = entries.filter(entry =>
                    !(entry.userId === currentUser.psId && entry.weekendDate === weekendDate)
                );

                localStorage.setItem('weekendEntries', JSON.stringify(updatedEntries));
                this.loadEntries();
                await showSuccess('Success', 'Weekend working entry has been deleted successfully.');
            } catch (error) {
                console.error('Delete entry error:', error);
                await showError('Error', 'Failed to delete weekend working entry.');
            }
        }
    }

    static getEntries() {
        const userId = getCurrentUser().psId;
        try {
            const entries = JSON.parse(localStorage.getItem('weekendEntries') || '[]');
            return entries.filter(entry => entry.userId === userId);
        } catch (error) {
            console.error('Error loading entries:', error);
            return [];
        }
    }

    static saveEntry(entry) {
        const entries = JSON.parse(localStorage.getItem('weekendEntries') || '[]');
        entries.push(entry);
        localStorage.setItem('weekendEntries', JSON.stringify(entries));
    }
}

// Make WeekendTracker available globally for onclick handlers
window.WeekendTracker = WeekendTracker;

export default WeekendTracker;
