import { getCurrentUser, showSuccess, showError } from './utils.js';

class WeekendTracker {
    static initialize() {
        this.initializeEventListeners();
        this.loadEntries();
    }

    static initializeEventListeners() {
        const addButton = document.getElementById('add-weekend-entry');
        const modal = document.getElementById('weekend-modal');
        const closeButtons = modal.querySelectorAll('.close-modal');
        const form = document.getElementById('weekend-form');
        const compOffEarned = document.getElementById('comp-off-earned');
        const compOffDateGroup = document.getElementById('comp-off-date-group');

        // Add Entry button
        addButton.addEventListener('click', () => {
            modal.classList.add('active');
        });

        // Close modal
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                modal.classList.remove('active');
                form.reset();
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
        }) : 'N/A'}</td>
                            <td class="status ${entry.expenseClaimed}">${entry.expenseClaimed}</td>
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

        const entry = {
            weekendDate: form.querySelector('#weekend-date').value,
            compOffEarned: form.querySelector('#comp-off-earned').value,
            compOffDate: form.querySelector('#comp-off-date').value || null,
            expenseClaimed: form.querySelector('#expense-claimed').value,
            userId: getCurrentUser().psId,
            createdAt: new Date().toISOString()
        };

        try {
            this.saveEntry(entry);
            modal.classList.remove('active'); // Close modal
            form.reset(); // Reset form
            this.loadEntries(); // Refresh entries
            await showSuccess('Success', 'Weekend working entry added successfully');
        } catch (error) {
            await showError('Error', error.message);
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

export default WeekendTracker;
