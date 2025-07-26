// World Clock Application
class WorldClock {
    constructor() {
        // Time zone mappings for each city (ordered from earliest to latest time)
        this.cities = {
            boston: {
                name: 'Boston',
                country: 'United States',
                timezone: 'America/New_York'
            },
            london: {
                name: 'London',
                country: 'United Kingdom',
                timezone: 'Europe/London'
            },
            delhi: {
                name: 'New Delhi',
                country: 'India',
                timezone: 'Asia/Kolkata'
            },
            singapore: {
                name: 'Singapore',
                country: 'Singapore',
                timezone: 'Asia/Singapore'
            },
            melbourne: {
                name: 'Melbourne',
                country: 'Australia',
                timezone: 'Australia/Melbourne'
            },
            wellington: {
                name: 'Wellington',
                country: 'New Zealand',
                timezone: 'Pacific/Auckland'
            }
        };

        this.isCustomMode = false;
        this.customBaseTime = null;
        this.selectedCity = null;
        this.updateInterval = null;

        this.initializeElements();
        this.setupEventListeners();
        this.startLiveMode();
    }

    initializeElements() {
        this.citySelect = document.getElementById('citySelect');
        this.customTimeInput = document.getElementById('customTime');
        this.resetBtn = document.getElementById('resetBtn');
        this.modeIndicator = document.getElementById('modeText');
        this.modeContainer = document.querySelector('.mode-indicator');
    }

    setupEventListeners() {
        // City selection change
        this.citySelect.addEventListener('change', (e) => {
            this.handleCitySelection(e.target.value);
        });

        // Custom time input change
        this.customTimeInput.addEventListener('change', (e) => {
            this.handleCustomTimeChange(e.target.value);
        });

        // Reset button
        this.resetBtn.addEventListener('click', () => {
            this.resetToLiveMode();
        });
    }

    handleCitySelection(selectedCity) {
        if (!selectedCity) {
            this.resetToLiveMode();
            return;
        }

        this.selectedCity = selectedCity;
        this.customTimeInput.disabled = false;
        
        // Set current time of selected city as default
        const currentTime = new Date();
        const cityTime = this.getTimeInTimezone(currentTime, this.cities[selectedCity].timezone);
        
        // Format for datetime-local input (YYYY-MM-DDTHH:MM)
        const formattedTime = this.formatForDateTimeInput(cityTime);
        this.customTimeInput.value = formattedTime;
        
        this.handleCustomTimeChange(formattedTime);
    }

    handleCustomTimeChange(customTimeValue) {
        if (!customTimeValue || !this.selectedCity) {
            return;
        }

        try {
            // Parse the datetime-local input value
            const customDate = new Date(customTimeValue);
            
            if (isNaN(customDate.getTime())) {
                console.error('Invalid date input');
                return;
            }

            this.isCustomMode = true;
            this.customBaseTime = customDate;
            
            this.updateModeIndicator();
            this.highlightSelectedCity();
            this.updateCustomTimes();
            
            // Stop live updates when in custom mode
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
                this.updateInterval = null;
            }
            
        } catch (error) {
            console.error('Error parsing custom time:', error);
        }
    }

    resetToLiveMode() {
        this.isCustomMode = false;
        this.customBaseTime = null;
        this.selectedCity = null;
        
        this.citySelect.value = '';
        this.customTimeInput.value = '';
        this.customTimeInput.disabled = true;
        
        this.updateModeIndicator();
        this.removeHighlight();
        this.startLiveMode();
    }

    startLiveMode() {
        // Clear any existing interval
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        // Update immediately
        this.updateLiveTimes();
        
        // Set up interval for live updates
        this.updateInterval = setInterval(() => {
            this.updateLiveTimes();
        }, 1000);
    }

    updateLiveTimes() {
        if (this.isCustomMode) return;
        
        const now = new Date();
        
        Object.keys(this.cities).forEach(cityKey => {
            this.updateCityDisplay(cityKey, now);
        });
    }

    updateCustomTimes() {
        if (!this.isCustomMode || !this.customBaseTime || !this.selectedCity) return;

        const selectedCityTimezone = this.cities[this.selectedCity].timezone;
        
        Object.keys(this.cities).forEach(cityKey => {
            const cityTimezone = this.cities[cityKey].timezone;
            
            if (cityKey === this.selectedCity) {
                // For the selected city, use the custom time directly
                this.updateCityDisplay(cityKey, this.customBaseTime);
            } else {
                // Calculate equivalent time in other cities
                const equivalentTime = this.convertTime(
                    this.customBaseTime,
                    selectedCityTimezone,
                    cityTimezone
                );
                this.updateCityDisplay(cityKey, equivalentTime);
            }
        });
    }

    convertTime(sourceTime, sourceTimezone, targetTimezone) {
        // Get the UTC time from the source time in source timezone
        const sourceTimeInUTC = this.getUTCFromTimezone(sourceTime, sourceTimezone);
        
        // Convert UTC time to target timezone
        return this.getTimeInTimezone(sourceTimeInUTC, targetTimezone);
    }

    getUTCFromTimezone(localTime, timezone) {
        // Create a date object representing the local time in the specified timezone
        const tempDate = new Date(localTime.getTime());
        
        // Get the timezone offset for the specified timezone
        const offsetMinutes = this.getTimezoneOffset(tempDate, timezone);
        
        // Adjust to UTC
        return new Date(tempDate.getTime() - (offsetMinutes * 60000));
    }

    getTimezoneOffset(date, timezone) {
        // Get the offset in minutes for a specific timezone
        const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
        const targetTime = new Date(utcTime).toLocaleString('en-US', { timeZone: timezone });
        const targetDate = new Date(targetTime);
        
        return (date.getTime() - targetDate.getTime()) / 60000;
    }

    getTimeInTimezone(date, timezone) {
        return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    }

    updateCityDisplay(cityKey, time) {
        const city = this.cities[cityKey];
        const timeElement = document.getElementById(`${cityKey}-time`);
        const dateElement = document.getElementById(`${cityKey}-date`);
        
        if (!timeElement || !dateElement) return;

        try {
            // Format time
            const timeOptions = {
                timeZone: city.timezone,
                hour12: true,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            };
            
            const formattedTime = new Intl.DateTimeFormat('en-US', timeOptions).format(time);
            
            // Format date
            const dateOptions = {
                timeZone: city.timezone,
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            };
            
            const formattedDate = new Intl.DateTimeFormat('en-US', dateOptions).format(time);
            
            // Update display with smooth transition
            timeElement.classList.add('updating');
            setTimeout(() => {
                timeElement.textContent = formattedTime;
                dateElement.textContent = formattedDate;
                timeElement.classList.remove('updating');
            }, 100);
            
        } catch (error) {
            console.error(`Error updating ${cityKey}:`, error);
            timeElement.textContent = 'Error';
            dateElement.textContent = 'Invalid timezone';
        }
    }

    formatForDateTimeInput(date) {
        // Format date for datetime-local input (YYYY-MM-DDTHH:MM)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    updateModeIndicator() {
        if (this.isCustomMode && this.selectedCity) {
            this.modeIndicator.textContent = `Custom Time Mode - ${this.cities[this.selectedCity].name}`;
            this.modeContainer.classList.add('custom-mode');
        } else {
            this.modeIndicator.textContent = 'Live Time Mode';
            this.modeContainer.classList.remove('custom-mode');
        }
    }

    highlightSelectedCity() {
        this.removeHighlight();
        if (this.selectedCity) {
            const cityCard = document.querySelector(`[data-city="${this.selectedCity}"]`);
            if (cityCard) {
                cityCard.classList.add('custom-selected');
            }
        }
    }

    removeHighlight() {
        document.querySelectorAll('.time-card').forEach(card => {
            card.classList.remove('custom-selected');
        });
    }

    // Error handling for timezone operations
    handleTimezoneError(error, cityKey) {
        console.error(`Timezone error for ${cityKey}:`, error);
        const timeElement = document.getElementById(`${cityKey}-time`);
        const dateElement = document.getElementById(`${cityKey}-date`);
        
        if (timeElement) timeElement.textContent = 'Error';
        if (dateElement) dateElement.textContent = 'Timezone unavailable';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        new WorldClock();
    } catch (error) {
        console.error('Failed to initialize World Clock:', error);
        
        // Show error message to user
        const container = document.querySelector('.container');
        if (container) {
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                background: #ff6b6b;
                color: white;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
                text-align: center;
                font-weight: bold;
            `;
            errorDiv.textContent = 'Error: Unable to initialize World Clock. Please refresh the page.';
            container.insertBefore(errorDiv, container.firstChild);
        }
    }
});

// Handle page visibility changes to optimize performance
document.addEventListener('visibilitychange', () => {
    const worldClock = window.worldClockInstance;
    if (worldClock) {
        if (document.hidden) {
            // Page is hidden, reduce update frequency or pause
            if (worldClock.updateInterval && !worldClock.isCustomMode) {
                clearInterval(worldClock.updateInterval);
                worldClock.updateInterval = setInterval(() => {
                    worldClock.updateLiveTimes();
                }, 5000); // Update every 5 seconds when hidden
            }
        } else {
            // Page is visible, resume normal updates
            if (!worldClock.isCustomMode) {
                worldClock.startLiveMode();
            }
        }
    }
});
