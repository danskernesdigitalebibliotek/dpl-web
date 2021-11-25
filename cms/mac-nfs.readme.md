
# Setup NFS (for mac/OSX users)

## First-time setup of NFS

If you want to use NFS, you'll need to do various things the very first time.

`/etc/exports` should contain information about your code folder

Assuming you're keeping your Docker/code projects in `~/code`, you'll want to add
this line to your `/etc/exports`:

`/System/Volumes/Data/Users/<USERNAME>/code -mapall=<USERNAME>:staff -alldirs localhost`

## Full access

`/sbin/nfsd` and your terminal program needs "Full disk access":

![OSX preference pane providing access to NFSD](documentation/images/nftd.png)

## Update your nfs.conf

Your `/etc/nfs.conf` file should contain the following line:

`nfs.server.mount.require_resv_port = 0`

Adding `/System/Volumes/Data` to Docker for Mac filesharing

After you've done all this, either restart your Mac or:

* `sudo nfsd restart`
* Restart Docker for Mac
* Close and re-open your terminal (not just a new prompt!)
