# kick-it

Can I kick it? If you can oauth via Spotify, yes you can


## Aims

To create a Spotify playlist app that allows you to add songs to a shared playlist and up/down vote songs.


## User stories

As a HOST i have the ability to create a playlist, label it and share the link for others to add songs

As a USER i can add songs to a playlist that has been shared with me. This becomes a QUEUE 

As a USER i can up/down vote songs that are already on the playlist. This will adjust the song position on the list in ascending order.

As a HOST and USER i can see a leader board telling me how many up and down votes each person has given. 

As a HOST i should have the ability to skip a song or mute a member of the party for a certain amount of time.


## User stories into code

| Objects/Noun   | Messages/Verbs |
| -------------  | -------------  |
| host           | create         |
| user           | upVote/downVote|
| queue/playlist |                |
