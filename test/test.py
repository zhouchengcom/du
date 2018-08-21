from tkinter import *
from PIL import Image, ImageTk, ImageGrab


def raise_frame(frame):
    frame.tkraise()


root = Tk()


def create_window():
    window = Toplevel(root)
    FullScreenApp(window)


class FullScreenApp(object):
    def __init__(self, master, **kwargs):
        self.master = master
        self.x, self.y = 0, 0
        master.overrideredirect(1)

        w, h = master.winfo_screenwidth(), master.winfo_screenheight()
        master.geometry(
            "{0}x{1}+0+0".format(w, h))
        # master.bind('<Escape>', self.toggle_geom)
        self.tw = w
        self.th = h
        master.focus_set()  # <-- move focus to this widget
        master.bind("<Escape>", lambda e: self.OnQuit())
        self.photo = ImageTk.PhotoImage(ImageGrab.grab())

        self.canvas = Canvas(self.master, width=w, height=h)

        # pack the canvas into a frame/form
        self.canvas.pack()

        # pic's upper left corner (NW) on the canvas is at x=50 y=10
        self.canvas.create_image(w/2, h/2, image=self.photo)
        self.rectt = self.canvas.create_rectangle(
            0, 0, w, h, fill="gray", outline="gray", stipple="gray50")
        self.rectd = self.canvas.create_rectangle(
            0, 0, 0, 0, fill="gray", outline="gray", stipple="gray50")
        self.rectlm = self.canvas.create_rectangle(
            0, 0, 0, 0, fill="gray", outline="gray", stipple="gray50")
        self.rectrm = self.canvas.create_rectangle(
            0, 0, 0, 0, fill="gray", outline="gray", stipple="gray50")
        # self.canvas.config(cursor='tcross')
        # self.canvas.create_rectangle(0, 0, w, h, fill=TRANSCOLOUR, outline=TRANSCOLOUR)

        self.canvas.bind("<ButtonPress-1>", self.on_button_press)
        self.canvas.bind("<B1-Motion>", self.on_move_press)
        self.canvas.bind("<ButtonRelease-1>", self.on_button_release)

        self.rect = None

        self.start_x = None
        self.start_y = None

        self.button = Button(
            self.master, text="OK", command=self.OnQuit)
        self.button.configure(
            width=20, relief=FLAT)

        self.buttonw = self.canvas.create_window(
            self.tw - (self.tw / 10), self.th - (self.th/10), window=self.button)

    def on_button_press(self, event):
        # save mouse drag start position
        self.start_x = self.canvas.canvasx(event.x)
        self.start_y = self.canvas.canvasy(event.y)

        # create rectangle if not yet exist
        if not self.rect:
            self.rect = self.canvas.create_rectangle(
                self.x, self.y, 1, 1, outline='red')

    def on_move_press(self, event):
        curX = self.canvas.canvasx(event.x)
        curY = self.canvas.canvasy(event.y)
        self.curX = curX
        self.curY = curY
        # expand rectangle as you drag the mouse
        self.canvas.coords(self.rect, self.start_x, self.start_y, curX, curY)

        self.canvas.coords(self.rectt, 0, 0, self.tw, self.start_y)
        self.canvas.coords(self.rectlm, 0, self.start_y, self.start_x, curY)
        self.canvas.coords(self.rectrm, curX,
                           self.start_y, self.tw, curY)
        self.canvas.coords(self.rectd, 0,
                           curY, self.tw, self.th)

    def on_button_release(self, event):
        pass

    def OnQuit(self):
        im = ImageGrab.grab((self.start_x, self.start_y, self.curX, self.curY))
        im.show()
        self.master.destroy()


# root = tk.Tk()
b = Button(root, text="Create new window", command=create_window)
b.pack()
root.mainloop()
