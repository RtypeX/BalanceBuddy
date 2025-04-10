
import ExerciseList from '@/components/ExerciseList';
import WorkoutBuilder from '@/components/WorkoutBuilder';
import ProgressTracker from '@/components/ProgressTracker';
import Profile from '@/components/Profile';
import PersonalizedWorkoutPlan from '@/components/PersonalizedWorkoutPlan';
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5">FitNext</h1>

      <Tabs defaultvalue="exercises" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
          <TabsTrigger value="builder">Workout Builder</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="ai">AI Workout Plan</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        <TabsContent value="exercises">
          <ExerciseList/>
        </TabsContent>
        <TabsContent value="builder">
          <WorkoutBuilder/>
        </TabsContent>
        <TabsContent value="progress">
          <ProgressTracker/>
        </TabsContent>
        <TabsContent value="ai">
          <PersonalizedWorkoutPlan/>
        </TabsContent>
        <TabsContent value="profile">
          <Profile/>
        </TabsContent>
      </Tabs>
    </div>
  );
}
