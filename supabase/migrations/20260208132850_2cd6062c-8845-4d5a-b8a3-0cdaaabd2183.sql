
CREATE TRIGGER notify_queue_change
AFTER UPDATE ON public.queue_state
FOR EACH ROW
EXECUTE FUNCTION public.notify_queue_change();
