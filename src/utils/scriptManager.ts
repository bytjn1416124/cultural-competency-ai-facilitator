export interface Section {
  id: string;
  title: string;
  duration: string;
  exercises: Exercise[];
  introduction: string;
}

export interface Exercise {
  id: string;
  title: string;
  duration: string;
  description: string;
  steps: string[];
  discussionPoints?: string[];
}

export const SCRIPT_SECTIONS: Section[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    duration: '30 minutes',
    introduction: 'Welcome everyone to our comprehensive Cultural Competency session for Liaison Psychiatry. Today, we\'ll be working through the contents of our Cultural Competency Workbook, adapting it into an interactive learning experience.',
    exercises: [
      {
        id: 'intro_exercise_1',
        title: 'Group Introductions',
        duration: '10 minutes',
        description: 'Participants introduce themselves and share their interests in cultural competency.',
        steps: [
          'Ask each participant to share their name and role',
          'Have them share one aspect of cultural competency they\'re interested in exploring',
          'Note down key interests for reference during the session'
        ]
      },
      {
        id: 'intro_exercise_2',
        title: 'Key Concepts Discussion',
        duration: '20 minutes',
        description: 'Establish shared understanding of key cultural competency concepts.',
        steps: [
          'Define Cultural Competency in Liaison Psychiatry',
          'Discuss Health Inequalities in Hospital Settings',
          'Explore the concept of Intersectionality',
          'Define Cultural Safety in Liaison Psychiatry'
        ],
        discussionPoints: [
          'How do cultural factors influence mental health care?',
          'What health inequalities have you observed?',
          'How might intersectionality impact patient experience?'
        ]
      }
    ]
  },
  {
    id: 'understanding_population',
    title: 'Understanding Our Hospital Population',
    duration: '90 minutes',
    introduction: 'Now that we\'ve established our key concepts, let\'s dive into understanding our hospital population. This section is crucial as it will inform all our subsequent work on cultural competency.',
    exercises: [
      {
        id: 'population_exercise_1',
        title: 'Demographic Deep Dive',
        duration: '30 minutes',
        description: 'Analyze the demographic makeup of our hospital population compared to service users.',
        steps: [
          'Break into small groups',
          'Compare hospital demographic data with service user data',
          'Calculate disparities and identify potential reasons',
          'Share findings and discuss implications'
        ]
      },
      {
        id: 'population_exercise_2',
        title: 'Cultural Asset Mapping',
        duration: '30 minutes',
        description: 'Create a comprehensive list of community resources and cultural assets.',
        steps: [
          'Map cultural assets for specific ethnic groups',
          'Identify existing connections with our service',
          'Explore potential for future collaboration',
          'Create master list of cultural assets'
        ]
      }
    ]
  },
  // Additional sections would continue here...
];

export class ScriptManager {
  private currentSectionIndex = 0;
  private currentExerciseIndex = 0;
  private currentStepIndex = 0;

  getCurrentSection(): Section {
    return SCRIPT_SECTIONS[this.currentSectionIndex];
  }

  getCurrentExercise(): Exercise {
    return this.getCurrentSection().exercises[this.currentExerciseIndex];
  }

  getCurrentStep(): string {
    return this.getCurrentExercise().steps[this.currentStepIndex];
  }

  getNextPrompt(): string {
    const section = this.getCurrentSection();
    const exercise = this.getCurrentExercise();

    if (this.currentStepIndex === 0 && this.currentExerciseIndex === 0) {
      return `${section.introduction}\n\nLet's begin with the first exercise: ${exercise.title}.\n${exercise.description}`;
    }

    return `Let's continue with the next step: ${this.getCurrentStep()}`;
  }

  moveToNextStep(): boolean {
    const exercise = this.getCurrentExercise();
    if (this.currentStepIndex < exercise.steps.length - 1) {
      this.currentStepIndex++;
      return true;
    }
    return this.moveToNextExercise();
  }

  moveToNextExercise(): boolean {
    const section = this.getCurrentSection();
    if (this.currentExerciseIndex < section.exercises.length - 1) {
      this.currentExerciseIndex++;
      this.currentStepIndex = 0;
      return true;
    }
    return this.moveToNextSection();
  }

  moveToNextSection(): boolean {
    if (this.currentSectionIndex < SCRIPT_SECTIONS.length - 1) {
      this.currentSectionIndex++;
      this.currentExerciseIndex = 0;
      this.currentStepIndex = 0;
      return true;
    }
    return false;
  }

  getProgress(): { section: number; total: number } {
    return {
      section: this.currentSectionIndex + 1,
      total: SCRIPT_SECTIONS.length
    };
  }

  getDiscussionPrompts(): string[] {
    const exercise = this.getCurrentExercise();
    return exercise.discussionPoints || [];
  }

  getTimeRemaining(): string {
    return this.getCurrentExercise().duration;
  }

  reset(): void {
    this.currentSectionIndex = 0;
    this.currentExerciseIndex = 0;
    this.currentStepIndex = 0;
  }
}
