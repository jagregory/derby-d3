export default (_, action, done) => setTimeout(done, action.duration * 1000)
