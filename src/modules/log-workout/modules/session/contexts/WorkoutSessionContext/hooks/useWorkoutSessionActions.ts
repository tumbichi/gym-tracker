import useWorkoutSessionContext from "./useWorkoutSessionContext";

const useWorkoutSessionActions = () => {
  const { actions } = useWorkoutSessionContext();
  return actions;
};

export default useWorkoutSessionActions;
