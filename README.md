# discord-video-saver

### This is a Discord bot

... which automatically downloads/reuploads Youtube/Twitch clips.

I like to share funny clips with my friends, but when the clips are deleted, I can't go back and re-watch them. This bot is the solution.

### Example:

![image](https://user-images.githubusercontent.com/1350889/126120293-f00e6e02-3584-4969-a845-10aad8189d2f.png)

### To run:

- Create a bot and invite it to your server with all the necessary permissions. Personally I enabled permissions for `bot` -> [`View Channels`, `Send Messages`, `Manage Messages`, `Attach Files`, `Read Message History`].
- Create a channel named `#clips`.
- Copy `.env.template` to `.env` and fill in the variables.
- Deploy via the Dockerfile. (`docker build -t discord-video-saver . && docker run --name dvsbot -d --restart unless-stopped discord-video-saver`)
- Any Youtube/Twitch clips you post to the channel will get automatically downloaded/reuploaded.

### Potential improvements:

The Docker image is not a production build. It needlessly includes all the `.ts` files and dev dependencies.
