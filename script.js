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
        
        // Set current time as default (in browser's timezone, which is fine for the input)
        const currentTime = new Date();
        
        // Format for datetime-local input (YYYY-MM-DDTHH:MM)
        const formattedTime = this.formatForDateTimeInput(currentTime);
        this.customTimeInput.value = formattedTime;
        
        this.handleCustomTimeChange(formattedTime);
    }

    handleCustomTimeChange(customTimeValue) {
        if (!customTimeValue || !this.selectedCity) {
            return;
        }

        try {
            // Parse the datetime-local input - this gives us the exact time the user entered
            const customTime = new Date(customTimeValue);
            
            if (isNaN(customTime.getTime())) {
                console.error('Invalid date input');
                return;
            }

            // Enter custom mode
            this.isCustomMode = true;
            this.customBaseTime = customTime;
            
            this.updateModeIndicator();
            this.highlightSelectedCity();
            
            // Stop live updates 
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
                this.updateInterval = null;
            }
            
            // Update all cities based on the custom time
            this.updateAllCitiesFromCustomTime();
            
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

    updateAllCitiesFromCustomTime() {
        if (!this.isCustomMode || !this.customBaseTime || !this.selectedCity) return;

        Object.keys(this.cities).forEach(cityKey => {
            if (cityKey === this.selectedCity) {
                // Step 1: Show the exact custom time in the selected city
                this.updateCityDisplay(cityKey, this.customBaseTime);
            } else {
                // Step 2: Calculate equivalent time in other cities
                const equivalentTime = this.getEquivalentTimeInCity(
                    this.customBaseTime,
                    this.cities[this.selectedCity].timezone,
                    this.cities[cityKey].timezone
                );
                this.updateCityDisplay(cityKey, equivalentTime);
            }
        });
    }

    getEquivalentTimeInCity(sourceTime, sourceTimezone, targetTimezone) {
        // Simple approach: Create a "fake" UTC time that would display as our desired time
        // in the source timezone, then convert that to the target timezone
        
        const year = sourceTime.getFullYear();
        const month = sourceTime.getMonth();
        const day = sourceTime.getDate();
        const hours = sourceTime.getHours();
        const minutes = sourceTime.getMinutes();
        const seconds = sourceTime.getSeconds();
        
        // Create a moment that when displayed in sourceTimezone shows our desired time
        // We do this by creating the time in UTC and adjusting by the timezone offset
        
        // Get today's date to check current timezone offsets (handles DST correctly)
        const today = new Date();
        
        // Create our time as if it were UTC
        const asUTC = new Date(Date.UTC(year, month, day, hours, minutes, seconds));
        
        // Get the current offset for the source timezone
        const sourceOffsetMs = this.getCurrentTimezoneOffset(today, sourceTimezone);
        
        // Get the current offset for the target timezone  
        const targetOffsetMs = this.getCurrentTimezoneOffset(today, targetTimezone);
        
        // Adjust the UTC time by the timezone difference
        const timeDifferenceMs = targetOffsetMs - sourceOffsetMs;
        
        return new Date(asUTC.getTime() + timeDifferenceMs);
    }

    getCurrentTimezoneOffset(date, timezone) {
        // Get the current timezone offset in milliseconds
        // This method uses the fact that toLocaleString with timeZone gives us the local time
        
        // Create the same moment in time but formatted for different timezones
        const utcTime = new Date(date.toLocaleString('en-CA', { timeZone: 'UTC' }));
        const localTime = new Date(date.toLocaleString('en-CA', { timeZone: timezone }));
        
        // The difference is the timezone offset
        return localTime.getTime() - utcTime.getTime();
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
