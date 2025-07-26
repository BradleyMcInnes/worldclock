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
            // Parse the datetime-local input value and treat it as the time in the selected city
            const inputDate = new Date(customTimeValue);
            
            if (isNaN(inputDate.getTime())) {
                console.error('Invalid date input');
                return;
            }

            // Store the custom time and selected city info
            this.customBaseTime = inputDate;
            this.isCustomMode = true;
            
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

        Object.keys(this.cities).forEach(cityKey => {
            if (cityKey === this.selectedCity) {
                // For the selected city, show the custom time directly
                this.updateCityDisplay(cityKey, this.customBaseTime);
            } else {
                // Calculate what time it would be in other cities when it's the custom time in the selected city
                const equivalentTime = this.convertTimeAcrossTimezones(
                    this.customBaseTime,
                    this.cities[this.selectedCity].timezone,
                    this.cities[cityKey].timezone
                );
                this.updateCityDisplay(cityKey, equivalentTime);
            }
        });
    }

    convertTimeAcrossTimezones(sourceTime, sourceTimezone, targetTimezone) {
        // Create a date representing "now" in the source timezone with the custom time
        const year = sourceTime.getFullYear();
        const month = sourceTime.getMonth();
        const day = sourceTime.getDate();
        const hours = sourceTime.getHours();
        const minutes = sourceTime.getMinutes();
        const seconds = sourceTime.getSeconds();

        // Create a date string that represents this exact time
        const isoString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        // Create a moment in time that would appear as this time in the source timezone
        // We do this by creating the time and then adjusting for timezone differences
        const testDate = new Date(`${isoString}.000Z`); // Create as UTC first
        
        // Find out what the current timezone offset is for both zones
        const now = new Date();
        const sourceOffset = this.getTimezoneOffsetFromUTC(now, sourceTimezone);
        const targetOffset = this.getTimezoneOffsetFromUTC(now, targetTimezone);
        
        // Calculate the time difference between zones
        const offsetDiff = targetOffset - sourceOffset;
        
        // Apply the difference to get the equivalent time
        return new Date(sourceTime.getTime() + (offsetDiff * 60000));
    }

    getTimezoneOffsetFromUTC(date, timezone) {
        // Get the difference in minutes between a timezone and UTC
        const timeInUTC = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
        const timeInTimezone = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
        return (timeInTimezone.getTime() - timeInUTC.getTime()) / 60000;
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
