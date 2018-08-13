# Member Retention Service

AKA Might Remember Stuff

This Lambda function is called with simple structured calls from slack or the interface to store information about member interest.

A request from slack quickly noting general interest could be formated as follows

    /mrs "Paul Beaudet" "info" "Works with arduinos and builds interface devices"

    /mrs "Will Lynch" "Learning" "Interested in giving turning lessons"

    /mrs "Josh D" "info" "Making battle bots with his kids"

or take quick notes about checkout interest

    /mrs "Paul Beaudet" "oxytorch"

    /mrs "Will Lynch" "cncmill"

Ideally once Paul gets checked out on the oxy torch the interest is removed from his mrs document in the interest collection. This may take some syncing with a checkout collection.

Another helpful feature given some adoption would be to add the ability to store member general or specific availability. E.G. Tuesdays Nights or Tuesday the 18th. This way resource managers can parse checkout needs and availability in one go. Collecting this information is still pretty manual, but the first general goal is just to remember the information in a centralized place.

Who noted the interest in the cases of learning or info can be helpful if someone else need some further clarification on a note. Time of report can also be useful meta data to see if the data seems in date. The idea is that we might follow up with our members more often to get more up to date notes about how we can help them or connect the with other members that could help.

Recalling the data should be as simple as just passing the member instead of trying to add information

    /mrs "Will Lynch"

    returned data

    Interested in giving turning lesson
    Checkout interest: cncmill, oxytorch

### Data structures

Each note event is stored as a document in an interest collection with "oid", "reporter", "time", "type", "description", "machineId" and "memberId" fields.

### Makerspace Contributors

Note: Changes deploy on push to master branch

Requires installing/running mongod, node, and npm. Can also require a slack webhook URI as that is its intended target output. Though without it things can be tested by falling back on logs
