<template>
  <section class="project-overview">
    <div class="metrics-container">
      <div class="metric-card smooth-fade-in">
        <h3 class="metric-title">Total Users</h3>
        <p class="metric-value">{{ animatedValues.userCount }}</p>
        <p class="metric-description">Number of active users registered on the platform.</p>
      </div>
      <div class="metric-card smooth-fade-in">
        <h3 class="metric-title">Total Animes</h3>
        <p class="metric-value">{{ animatedValues.AnimeEntries }}</p>
        <p class="metric-description">Total number of Anime entries in the database.</p>
      </div>
      <div class="metric-card smooth-fade-in">
        <h3 class="metric-title">Total Characters</h3>
        <p class="metric-value">{{ animatedValues.CharacterEntries }}</p>
        <p class="metric-description">Total number of Character entries in the database.</p>
      </div>
      <div class="metric-card smooth-fade-in">
        <h3 class="metric-title">API Requests</h3>
        <p class="metric-value">{{ animatedValues.RequestsLast30Days }}</p>
        <p class="metric-description">Number of API requests made in the past month.</p>
      </div>
    </div>
    <div v-if="error" class="error-message">{{ error }}</div>
  </section>
</template>

<script>
import { fetchStats } from "@/services/fetchService";

export default {
  name: 'ProjectOverview',
  data() {
    return {
      stats: null,
      error: null,
      animatedValues: {
        userCount: 0,
        AnimeEntries: 0,
        CharacterEntries: 0,
        RequestsLast30Days: 0,
      },
    };
  },
  methods: {
    async updateStats() {
      try {
        const newStats = await fetchStats();
        this.stats = newStats;
        this.error = null;
        this.animateValues(newStats);
      } catch (error) {
        this.error = error.message || 'Failed to load stats.';
      }
    },
    animateValues(newStats) {
      const duration = 1000;
      const stepTime = 20;
      const steps = duration / stepTime;

      Object.keys(this.animatedValues).forEach((key) => {
        const startValue = this.animatedValues[key];
        const endValue = newStats[key] || startValue;
        const increment = (endValue - startValue) / steps;

        let currentStep = 0;

        const updateValue = () => {
          currentStep += 1;
          this.animatedValues[key] = Math.round(startValue + increment * currentStep);

          if (currentStep < steps) {
            setTimeout(updateValue, stepTime);
          }
        };

        updateValue();
      });
    }
  },
  created() {
    this.updateStats();
    this.interval = setInterval(this.updateStats, 10000);
  },
  beforeUnmount() {
    clearInterval(this.interval);
  }
};
</script>

<style scoped>
.project-overview {
  background-color: var(--background);
  text-align: center;
  padding: 4em 2em;
}

.metrics-container {
  display: flex;
  justify-content: center;
  gap: 2em;
  flex-wrap: wrap;
}

.metric-card {
  background-color: var(--background-50);
  border: 1px solid var(--background-300);
  border-radius: var(--border-radius-md);
  padding: 2em;
  box-shadow: var(--shadow-md);
  flex: 1;
  max-width: 250px;
  min-width: 200px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.metric-title {
  font-size: var(--text-lg);
  color: var(--text-800);
  margin-bottom: 0.5em;
}

.metric-value {
  font-size: var(--text-3xl);
  font-weight: bold;
  color: var(--primary);
  margin-bottom: 0.5em;
}

.metric-description {
  color: var(--text-600);
  font-size: var(--text-base);
}

.error-message {
  color: red;
  font-size: var(--text-lg);
  margin-top: 1em;
}

@media (max-width: 1110px) {
  .metrics-container {
    gap: 1.5em;
  }

  .metric-card {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .metric-card {
    margin: 0.5em 0;
  }
}
</style>
