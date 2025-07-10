Hackorbit Notes:

This is the most difficult project in here.
I had some initial code for excalidraw clone, you can view at: https://github.com/FirePheonix/Excalidraw-Frontend 

How how it works like:
For straight lines and arrows:
It has the starting and ending point saved in storage.

For shapes:
They are also made with starting and ending points.

For code block:
1 div -> Divided between 4 divs:
1) The context div which takes which language we are coding inside.
2) The input div in which we write code
3) The ouput div in which output of code is written.
4) The AI explanation div which has explanation of the code for learners.

For Text block:
You can add a normal text block -> Has an error such that the written things go outside of the block.


And all of the above is saved a JSON data is stored in session storage.


The project is backended with mongoDB and authorized with clerk.
mongoDB has different chats -> each chat STORES the json data of THAT chat ID.
Each chat ID is linked to the user ID who made that chat.
It doesn't have the autosave mode since THAT made the entire project very laggy since it kept autosaving at every point.


I used claude for multiple errors:
Expansion and contraction of blocks, especially the TEXT box and CODE block.
Backend Mongo DB errors.
The most difficult part was of saving the json data to mongo db.
Then came the deployment issues I faced. Learnt a lot deploying this project on to Vercel. 
Got into so many typescript errors, so many.
I followed step by step process for deployment given by claude then for deployment. It even generated a .md file for backend.
Building the MVP was much easier, since I knew how it worked. But this whole project alone took 13-14 hours of time but I pulled it off somehow right before my meet with the meet with my mentor. Was awake the whole 36 hours.
